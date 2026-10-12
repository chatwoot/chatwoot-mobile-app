import AVFoundation
import CallKit
import ExpoModulesCore
import TwilioVoice
import WebRTC

// Receives Twilio call callbacks and forwards them as a single state event, with the call
// they belong to so a late callback from an ended call can be told apart.
private final class TwilioCallHandler: NSObject, CallDelegate {
  var onState: ((Call, String, String?) -> Void)?

  func callDidStartRinging(call: Call) {
    onState?(call, "ringing", nil)
  }

  func callDidConnect(call: Call) {
    onState?(call, "connected", nil)
  }

  func callIsReconnecting(call: Call, error: Error) {
    onState?(call, "reconnecting", error.localizedDescription)
  }

  func callDidReconnect(call: Call) {
    onState?(call, "connected", nil)
  }

  func callDidFailToConnect(call: Call, error: Error) {
    onState?(call, "failed", error.localizedDescription)
  }

  func callDidDisconnect(call: Call, error: Error?) {
    onState?(call, "disconnected", error?.localizedDescription)
  }
}

private struct ReportCallRecord: Record {
  @Field var callSid: String
  @Field var provider: String
  @Field var displayName: String
  @Field var handle: String
  @Field var conversationId: Int?
  @Field var inboxId: Int?
  @Field var accountId: Int?
}

public class ChatwootCallsModule: Module {
  private let audioDevice = DefaultAudioDevice()
  private let handler = TwilioCallHandler()
  private var activeCall: Call?
  private var ringbackPlayer: AVAudioPlayer?
  private var ringbackWanted = false
  // The audio session is active with WebRTC as the call's media engine
  private var webrtcSessionActive = false

  // WebRTC's audio stays off while the ringback plays: its voice processing turns other
  // audio down to almost nothing, and before the contact answers there is nothing to send
  // or hear. The ringback waits for the session to be active.
  private func applyRingback() {
    let rtcSession = RTCAudioSession.sharedInstance()
    if ringbackWanted && webrtcSessionActive {
      rtcSession.isAudioEnabled = false
      guard ringbackPlayer == nil, let player = try? AVAudioPlayer(data: Self.ringbackWav()) else { return }
      player.numberOfLoops = -1
      player.play()
      ringbackPlayer = player
    } else {
      ringbackPlayer?.stop()
      ringbackPlayer = nil
      if webrtcSessionActive { rtcSession.isAudioEnabled = true }
    }
  }
  private let callKit = CallKitManager.shared

  private static let endReasons: [String: CXCallEndedReason] = [
    "remote": .remoteEnded,
    "unanswered": .unanswered,
    "answered_elsewhere": .answeredElsewhere,
    "declined_elsewhere": .declinedElsewhere,
    "failed": .failed,
  ]

  // The Bluetooth headset taken off the session while the earpiece is chosen, by name, so
  // it stays on offer
  static var heldBackBluetooth: String?

  // During a call iOS keeps a connected Bluetooth headset over the input the app prefers,
  // so choosing the earpiece takes Bluetooth off the session's routes and choosing the
  // headset puts it back
  static func allowBluetooth(_ allowed: Bool) {
    let session = AVAudioSession.sharedInstance()
    var options = session.categoryOptions
    if allowed {
      heldBackBluetooth = nil
      options.insert(.allowBluetooth)
    } else {
      let headset = session.availableInputs?.first { [.bluetoothHFP, .bluetoothLE].contains($0.portType) }
      if let headset { heldBackBluetooth = headset.portName }
      options.remove(.allowBluetooth)
    }
    guard options != session.categoryOptions else { return }
    try? session.setCategory(session.category, mode: session.mode, options: options)
  }

  // The session's output as one of the app's route names, and the routes on offer
  static func audioRouteInfo() -> [String: Any] {
    let session = AVAudioSession.sharedInstance()
    let output = session.currentRoute.outputs.first?.portType
    let current: String
    switch output {
    case .builtInSpeaker: current = "speaker"
    case .builtInReceiver: current = "earpiece"
    case .bluetoothHFP, .bluetoothA2DP, .bluetoothLE: current = "bluetooth"
    case .headphones, .headsetMic: current = "wired"
    default: current = "unknown"
    }
    var available = ["earpiece", "speaker"]
    var names = ["", ""]
    let inputs = session.availableInputs ?? []
    if let bluetooth = inputs.first(where: { [.bluetoothHFP, .bluetoothLE].contains($0.portType) }) {
      available.append("bluetooth")
      names.append(bluetooth.portName)
    } else if let heldBack = heldBackBluetooth {
      available.append("bluetooth")
      names.append(heldBack)
    }
    if let wired = inputs.first(where: { $0.portType == .headsetMic }) {
      available.append("wired")
      names.append(wired.portName)
    }
    return ["current": current, "available": available, "names": names]
  }

  // The double ring heard while the far end rings, as a WAV: 400 Hz and 450 Hz together,
  // on 0.4 s, off 0.2 s, on 0.4 s, then 2 s of silence. Each burst fades in and out over
  // 10 ms so it starts and stops without a click.
  static func ringbackWav() -> Data {
    let rate = 8000
    let fadeSamples = 80
    let pattern: [(Double, Bool)] = [(0.4, true), (0.2, false), (0.4, true), (2.0, false)]
    var samples: [Int16] = []
    var t = 0
    for (seconds, on) in pattern {
      let count = Int(seconds * Double(rate))
      for i in 0..<count {
        var value = 0.0
        if on {
          let time = Double(t) / Double(rate)
          let fade = min(1.0, Double(min(i, count - i)) / Double(fadeSamples))
          value = (sin(2 * .pi * 400 * time) + sin(2 * .pi * 450 * time)) * 0.25 * fade
        }
        samples.append(Int16(value * Double(Int16.max)))
        t += 1
      }
    }
    var data = Data()
    func append<T: FixedWidthInteger>(_ value: T) {
      withUnsafeBytes(of: value.littleEndian) { data.append(contentsOf: $0) }
    }
    let byteCount = samples.count * 2
    data.append(contentsOf: Array("RIFF".utf8)); append(UInt32(36 + byteCount))
    data.append(contentsOf: Array("WAVEfmt ".utf8)); append(UInt32(16))
    append(UInt16(1)); append(UInt16(1)); append(UInt32(rate)); append(UInt32(rate * 2))
    append(UInt16(2)); append(UInt16(16))
    data.append(contentsOf: Array("data".utf8)); append(UInt32(byteCount))
    samples.forEach { append($0) }
    return data
  }

  private func emitAudioRoute() {
    sendEvent("onAudioRoute", Self.audioRouteInfo())
  }

  // Voice-chat category and mode, applied before the system activates the session
  private static func configureWebrtcAudioSession() {
    let rtcSession = RTCAudioSession.sharedInstance()
    rtcSession.lockForConfiguration()
    try? rtcSession.setConfiguration(RTCAudioSessionConfiguration.webRTC())
    rtcSession.unlockForConfiguration()
  }

  public func definition() -> ModuleDefinition {
    Name("ChatwootCalls")

    Events("onTwilioCallState", "onCallKitAction", "onIncomingCall", "onVoipToken", "onAudioSession", "onAudioRoute")

    OnDestroy {
      self.callKit.markJsUnready()
    }

    OnCreate {
      TwilioVoiceSDK.audioDevice = self.audioDevice
      // CallKit owns the audio session: neither media engine starts audio on its own, each
      // is switched on when the system activates the session and off when it deactivates
      self.audioDevice.isEnabled = false
      let rtcSession = RTCAudioSession.sharedInstance()
      rtcSession.useManualAudio = true
      rtcSession.isAudioEnabled = false
      self.handler.onState = { [weak self] call, state, error in
        // Only the current call reports; an earlier one ending late must not end this one
        guard let self, call === self.activeCall else { return }
        if state == "disconnected" || state == "failed" {
          self.activeCall = nil
        }
        var payload: [String: Any] = ["state": state]
        if let error { payload["error"] = error }
        self.sendEvent("onTwilioCallState", payload)
      }
      self.callKit.emit = { [weak self] name, body in self?.sendEvent(name, body) }
      self.callKit.prepareAudioSession = { provider in
        if provider == "whatsapp" { Self.configureWebrtcAudioSession() }
      }
      self.callKit.endMedia = { [weak self] provider in
        guard provider == "twilio", let self else { return }
        self.activeCall?.disconnect()
        self.activeCall = nil
      }
      // The session goes to one media engine at a time: the call's provider's
      self.callKit.audioSessionDidActivate = { [weak self] session, provider in
        let rtcSession = RTCAudioSession.sharedInstance()
        if provider == "twilio" {
          self?.webrtcSessionActive = false
          rtcSession.isAudioEnabled = false
          self?.audioDevice.isEnabled = true
        } else {
          guard let self else { return }
          self.audioDevice.isEnabled = false
          rtcSession.audioSessionDidActivate(session)
          self.webrtcSessionActive = true
          rtcSession.isAudioEnabled = !self.ringbackWanted
          self.applyRingback()
        }
      }
      self.callKit.audioSessionDidDeactivate = { [weak self] session, _ in
        // The next call starts with a connected headset on offer again
        Self.allowBluetooth(true)
        self?.webrtcSessionActive = false
        self?.ringbackPlayer?.stop()
        self?.ringbackPlayer = nil
        self?.audioDevice.isEnabled = false
        let rtcSession = RTCAudioSession.sharedInstance()
        rtcSession.isAudioEnabled = false
        rtcSession.audioSessionDidDeactivate(session)
      }
      self.callKit.replayAudioSessionIfActive()
      NotificationCenter.default.addObserver(
        forName: AVAudioSession.routeChangeNotification, object: nil, queue: .main
      ) { [weak self] _ in
        self?.emitAudioRoute()
      }
    }

    // Starts WebRTC audio for a call that has no system call behind it, activating the
    // session directly since CallKit will not
    Function("activateWebrtcAudio") {
      Self.configureWebrtcAudioSession()
      let session = AVAudioSession.sharedInstance()
      try? session.setActive(true)
      let rtcSession = RTCAudioSession.sharedInstance()
      rtcSession.audioSessionDidActivate(session)
      // The ringback state lives on the main queue
      DispatchQueue.main.async {
        self.webrtcSessionActive = true
        rtcSession.isAudioEnabled = !self.ringbackWanted
        self.applyRingback()
      }
    }

    Function("deactivateWebrtcAudio") {
      DispatchQueue.main.async {
        self.webrtcSessionActive = false
        self.ringbackPlayer?.stop()
        self.ringbackPlayer = nil
      }
      let rtcSession = RTCAudioSession.sharedInstance()
      rtcSession.isAudioEnabled = false
      rtcSession.audioSessionDidDeactivate(AVAudioSession.sharedInstance())
      try? AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
    }

    // MARK: Twilio media

    // Dials into the Twilio conference through the TwiML app. `params` become the
    // TwiML request parameters (To, is_agent, conversation_id, call_sid).
    // A call CallKit tracks is connected with its CallKit UUID, so Twilio leaves the audio
    // session to CallKit and this module
    AsyncFunction("twilioConnect") { (token: String, params: [String: String]) in
      self.activeCall?.disconnect()
      let callKitUuid = params["call_sid"].flatMap { sid in Self.onMain { self.callKit.call(forSid: sid)?.uuid } }
      let options = ConnectOptions(accessToken: token) { builder in
        builder.params = params
        if let callKitUuid { builder.uuid = callKitUuid }
      }
      self.activeCall = TwilioVoiceSDK.connect(options: options, delegate: self.handler)
      self.sendEvent("onTwilioCallState", ["state": "connecting"])
    }

    Function("twilioDisconnect") {
      self.activeCall?.disconnect()
      self.activeCall = nil
    }

    Function("twilioSetMuted") { (muted: Bool) in
      self.activeCall?.isMuted = muted
    }

    // Held: Twilio stops sending and playing audio until the call is resumed
    Function("twilioSetHold") { (hold: Bool) in
      self.activeCall?.isOnHold = hold
    }

    // Audio for a Twilio call with no system call behind it, which CallKit never activates
    Function("twilioSetAudioEnabled") { (enabled: Bool) in
      self.audioDevice.isEnabled = enabled
    }

    // A ringback for a WhatsApp call this device placed, while the contact's phone rings.
    // It plays into the call's audio session, so it follows the call's route.
    Function("startRingback") {
      DispatchQueue.main.async {
        self.ringbackWanted = true
        self.applyRingback()
      }
    }

    Function("stopRingback") {
      DispatchQueue.main.async {
        guard self.ringbackWanted else { return }
        self.ringbackWanted = false
        self.applyRingback()
      }
    }

    // Speaker routing for whichever engine holds the audio session
    Function("setSpeakerOn") { (enabled: Bool) in
      let session = AVAudioSession.sharedInstance()
      try? session.overrideOutputAudioPort(enabled ? .speaker : .none)
    }

    // A named route: speaker, earpiece, bluetooth or wired. The session follows the
    // preferred input, which is how a headset is chosen over the built-in microphone.
    Function("setAudioRoute") { (route: String) in
      let session = AVAudioSession.sharedInstance()
      switch route {
      case "speaker":
        try? session.overrideOutputAudioPort(.speaker)
      case "bluetooth", "wired":
        Self.allowBluetooth(true)
        try? session.overrideOutputAudioPort(.none)
        let wanted: Set<AVAudioSession.Port> = route == "bluetooth" ? [.bluetoothHFP, .bluetoothLE] : [.headsetMic]
        if let input = session.availableInputs?.first(where: { wanted.contains($0.portType) }) {
          try? session.setPreferredInput(input)
        }
      default:
        Self.allowBluetooth(false)
        try? session.overrideOutputAudioPort(.none)
        if let input = session.availableInputs?.first(where: { $0.portType == .builtInMic }) {
          try? session.setPreferredInput(input)
        }
      }
    }

    Function("currentAudioRoute") { () -> [String: Any] in
      return Self.audioRouteInfo()
    }

    // MARK: CallKit

    // JS is listening; flush anything that happened before it attached
    Function("callKitReady") {
      DispatchQueue.main.async { self.callKit.markJsReady() }
    }

    Function("getPendingCalls") { () -> [[String: Any]] in
      return Self.onMain { self.callKit.pendingCalls() }
    }

    Function("getVoipToken") { () -> String? in
      return self.callKit.voipToken
    }

    // Shows the system incoming-call UI for a call that reached the app over the socket
    AsyncFunction("callKitReportIncoming") { (record: ReportCallRecord, promise: Promise) in
      _ = self.callKit.reportIncomingCall(
        callSid: record.callSid, provider: record.provider, displayName: record.displayName,
        handle: record.handle, conversationId: record.conversationId, inboxId: record.inboxId,
        accountId: record.accountId
      ) { uuid, error in
        if let error { promise.reject("ERR_CALLKIT", error.localizedDescription) } else { promise.resolve(uuid.uuidString) }
      }
    }.runOnQueue(.main)

    AsyncFunction("callKitStartOutgoing") { (record: ReportCallRecord, promise: Promise) in
      _ = self.callKit.startOutgoingCall(
        callSid: record.callSid, provider: record.provider, displayName: record.displayName,
        handle: record.handle, conversationId: record.conversationId, inboxId: record.inboxId
      ) { uuid, error in
        if let error { promise.reject("ERR_CALLKIT", error.localizedDescription) } else { promise.resolve(uuid.uuidString) }
      }
    }.runOnQueue(.main)

    Function("callKitReportConnected") { (uuid: String) in
      guard let id = UUID(uuidString: uuid) else { return }
      DispatchQueue.main.async { self.callKit.reportConnected(uuid: id) }
    }

    // Ends the system call for a reason outside the user's action on this device
    Function("callKitEndCall") { (uuid: String, reason: String) in
      guard let id = UUID(uuidString: uuid) else { return }
      DispatchQueue.main.async { self.callKit.endCall(uuid: id, reason: Self.endReasons[reason] ?? .remoteEnded) }
    }

    // User actions from our own UI go through CallKit so the system state stays in step
    AsyncFunction("callKitRequestAnswer") { (uuid: String, promise: Promise) in
      guard let id = UUID(uuidString: uuid) else { return promise.reject("ERR_CALLKIT", "Invalid uuid") }
      self.callKit.requestAnswer(uuid: id) { error in
        if let error { promise.reject("ERR_CALLKIT", error.localizedDescription) } else { promise.resolve(nil) }
      }
    }.runOnQueue(.main)

    AsyncFunction("callKitRequestEnd") { (uuid: String, promise: Promise) in
      guard let id = UUID(uuidString: uuid) else { return promise.reject("ERR_CALLKIT", "Invalid uuid") }
      self.callKit.requestEnd(uuid: id) { error in
        if let error { promise.reject("ERR_CALLKIT", error.localizedDescription) } else { promise.resolve(nil) }
      }
    }.runOnQueue(.main)

    // Hold and resume for a call CallKit tracks; the held action then applies the change.
    // False when the call is not known to CallKit, so the caller holds the media itself.
    Function("holdCall") { (callSid: String) -> Bool in
      Self.onMain { self.requestHeld(callSid: callSid, onHold: true) }
    }

    Function("resumeCall") { (callSid: String) -> Bool in
      Self.onMain { self.requestHeld(callSid: callSid, onHold: false) }
    }

    AsyncFunction("callKitRequestMute") { (uuid: String, muted: Bool, promise: Promise) in
      guard let id = UUID(uuidString: uuid) else { return promise.reject("ERR_CALLKIT", "Invalid uuid") }
      self.callKit.requestMute(uuid: id, muted: muted) { error in
        if let error { promise.reject("ERR_CALLKIT", error.localizedDescription) } else { promise.resolve(nil) }
      }
    }.runOnQueue(.main)
  }

  // CallKit's state lives on the main queue, where its own callbacks arrive; calls from
  // JavaScript are moved there so its ring timers run and its state is not shared
  private static func onMain<T>(_ body: () -> T) -> T {
    Thread.isMainThread ? body() : DispatchQueue.main.sync(execute: body)
  }

  private func requestHeld(callSid: String, onHold: Bool) -> Bool {
    guard let tracked = callKit.call(forSid: callSid), tracked.answered || tracked.outgoing else { return false }
    callKit.requestHold(uuid: tracked.uuid, onHold: onHold) { _ in }
    return true
  }
}
