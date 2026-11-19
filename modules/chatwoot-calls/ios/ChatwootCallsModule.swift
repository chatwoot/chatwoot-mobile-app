import AVFoundation
import CallKit
import ExpoModulesCore
import TwilioVoice
import WebRTC

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
  @Field var callId: Int?
}

public class ChatwootCallsModule: Module {
  private let audioDevice = DefaultAudioDevice()
  private let handler = TwilioCallHandler()
  private var activeCall: Call?
  private var activeCallSid: String?
  private var ringbackPlayer: AVAudioPlayer?
  private var ringbackWanted = false
  private var webrtcSessionActive = false

  // WebRTC voice processing suppresses ringback audio.
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

  // Retain hidden headsets for route selection.
  static var heldBackBluetooth: String?

  // Bluetooth overrides preferred input during calls.
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
    // WebRTC reapplies configuration when audio starts.
    let webrtc = RTCAudioSessionConfiguration.webRTC()
    if allowed { webrtc.categoryOptions.insert(.allowBluetooth) } else { webrtc.categoryOptions.remove(.allowBluetooth) }
    RTCAudioSessionConfiguration.setWebRTC(webrtc)
    guard options != session.categoryOptions else { return }
    try? session.setCategory(session.category, mode: session.mode, options: options)
  }

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

  // Fades prevent clicks at burst boundaries.
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
      // CallKit owns both engines' audio activation.
      self.audioDevice.isEnabled = false
      let rtcSession = RTCAudioSession.sharedInstance()
      rtcSession.useManualAudio = true
      rtcSession.isAudioEnabled = false
      self.handler.onState = { [weak self] call, state, error in
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
      self.callKit.endMedia = { [weak self] provider, callSid in
        guard provider == "twilio", let self else { return }
        if let callSid, let current = self.activeCallSid, current != callSid { return }
        self.activeCall?.disconnect()
        self.activeCall = nil
        self.activeCallSid = nil
      }
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

    // Activate directly without a CallKit call.
    Function("activateWebrtcAudio") {
      Self.configureWebrtcAudioSession()
      let session = AVAudioSession.sharedInstance()
      try? session.setActive(true)
      let rtcSession = RTCAudioSession.sharedInstance()
      rtcSession.audioSessionDidActivate(session)
      // Ringback state belongs to main queue.
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


    // CallKit UUID delegates audio session ownership.
    AsyncFunction("twilioConnect") { (token: String, params: [String: String]) in
      self.activeCall?.disconnect()
      let callKitUuid = params["call_sid"].flatMap { sid in Self.onMain { self.callKit.call(forSid: sid)?.uuid } }
      let options = ConnectOptions(accessToken: token) { builder in
        builder.params = params
        if let callKitUuid { builder.uuid = callKitUuid }
      }
      self.activeCallSid = params["call_sid"]
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

    Function("twilioSetHold") { (hold: Bool) in
      self.activeCall?.isOnHold = hold
    }

    Function("twilioSetAudioEnabled") { (enabled: Bool) in
      self.audioDevice.isEnabled = enabled
    }

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

    Function("setSpeakerOn") { (enabled: Bool) in
      let session = AVAudioSession.sharedInstance()
      try? session.overrideOutputAudioPort(enabled ? .speaker : .none)
    }

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


    Function("callKitReady") {
      DispatchQueue.main.async { self.callKit.markJsReady() }
    }

    Function("getPendingCalls") { () -> [[String: Any]] in
      return Self.onMain { self.callKit.pendingCalls() }
    }

    Function("getVoipToken") { () -> String? in
      return self.callKit.voipToken
    }

    Function("setSignedIn") { (signedIn: Bool) in
      self.callKit.signedIn = signedIn
    }

    AsyncFunction("callKitReportIncoming") { (record: ReportCallRecord, promise: Promise) in
      _ = self.callKit.reportIncomingCall(
        callSid: record.callSid, provider: record.provider, displayName: record.displayName,
        handle: record.handle, conversationId: record.conversationId, inboxId: record.inboxId,
        accountId: record.accountId, callId: record.callId
      ) { uuid, error in
        if let error { promise.reject("ERR_CALLKIT", error.localizedDescription) } else { promise.resolve(uuid.uuidString) }
      }
    }.runOnQueue(.main)

    AsyncFunction("callKitStartOutgoing") { (record: ReportCallRecord, promise: Promise) in
      _ = self.callKit.startOutgoingCall(
        callSid: record.callSid, provider: record.provider, displayName: record.displayName,
        handle: record.handle, conversationId: record.conversationId, inboxId: record.inboxId,
        accountId: record.accountId, callId: record.callId
      ) { uuid, error in
        if let error { promise.reject("ERR_CALLKIT", error.localizedDescription) } else { promise.resolve(uuid.uuidString) }
      }
    }.runOnQueue(.main)

    Function("callKitReportConnected") { (uuid: String) in
      guard let id = UUID(uuidString: uuid) else { return }
      DispatchQueue.main.async { self.callKit.reportConnected(uuid: id) }
    }

    Function("callKitEndCall") { (uuid: String, reason: String) in
      guard let id = UUID(uuidString: uuid) else { return }
      DispatchQueue.main.async { self.callKit.endCall(uuid: id, reason: Self.endReasons[reason] ?? .remoteEnded) }
    }

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

  // Main queue owns CallKit state.
  private static func onMain<T>(_ body: () -> T) -> T {
    Thread.isMainThread ? body() : DispatchQueue.main.sync(execute: body)
  }

  private func requestHeld(callSid: String, onHold: Bool) -> Bool {
    guard let tracked = callKit.call(forSid: callSid), tracked.answered || tracked.outgoing else { return false }
    callKit.requestHold(uuid: tracked.uuid, onHold: onHold) { _ in }
    return true
  }
}
