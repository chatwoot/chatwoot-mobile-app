import AVFoundation
import CallKit
import ExpoModulesCore
import TwilioVoice
import WebRTC

// Receives Twilio call callbacks and forwards them as a single state event.
private final class TwilioCallHandler: NSObject, CallDelegate {
  var onState: ((String, String?) -> Void)?

  func callDidStartRinging(call: Call) {
    onState?("ringing", nil)
  }

  func callDidConnect(call: Call) {
    onState?("connected", nil)
  }

  func callIsReconnecting(call: Call, error: Error) {
    onState?("reconnecting", error.localizedDescription)
  }

  func callDidReconnect(call: Call) {
    onState?("connected", nil)
  }

  func callDidFailToConnect(call: Call, error: Error) {
    onState?("failed", error.localizedDescription)
  }

  func callDidDisconnect(call: Call, error: Error?) {
    onState?("disconnected", error?.localizedDescription)
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
  private let callKit = CallKitManager.shared

  private static let endReasons: [String: CXCallEndedReason] = [
    "remote": .remoteEnded,
    "unanswered": .unanswered,
    "answered_elsewhere": .answeredElsewhere,
    "declined_elsewhere": .declinedElsewhere,
    "failed": .failed,
  ]

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
    }
    if let wired = inputs.first(where: { $0.portType == .headsetMic }) {
      available.append("wired")
      names.append(wired.portName)
    }
    return ["current": current, "available": available, "names": names]
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

    OnCreate {
      TwilioVoiceSDK.audioDevice = self.audioDevice
      // CallKit owns the audio session: neither media engine starts audio on its own, each
      // is switched on when the system activates the session and off when it deactivates
      self.audioDevice.isEnabled = false
      let rtcSession = RTCAudioSession.sharedInstance()
      rtcSession.useManualAudio = true
      rtcSession.isAudioEnabled = false
      self.handler.onState = { [weak self] state, error in
        guard let self else { return }
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
      self.callKit.audioSessionDidActivate = { [weak self] session, provider in
        if provider == "twilio" {
          self?.audioDevice.isEnabled = true
        } else {
          let rtcSession = RTCAudioSession.sharedInstance()
          rtcSession.audioSessionDidActivate(session)
          rtcSession.isAudioEnabled = true
        }
      }
      self.callKit.audioSessionDidDeactivate = { [weak self] session, _ in
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
      rtcSession.isAudioEnabled = true
    }

    Function("deactivateWebrtcAudio") {
      let rtcSession = RTCAudioSession.sharedInstance()
      rtcSession.isAudioEnabled = false
      rtcSession.audioSessionDidDeactivate(AVAudioSession.sharedInstance())
      try? AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
    }

    // MARK: Twilio media

    // Dials into the Twilio conference through the TwiML app. `params` become the
    // TwiML request parameters (To, is_agent, conversation_id, call_sid).
    AsyncFunction("twilioConnect") { (token: String, params: [String: String]) in
      self.activeCall?.disconnect()
      let options = ConnectOptions(accessToken: token) { builder in
        builder.params = params
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

    Function("twilioIsConnected") { () -> Bool in
      return self.activeCall?.state == .connected
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
        try? session.overrideOutputAudioPort(.none)
        let wanted: Set<AVAudioSession.Port> = route == "bluetooth" ? [.bluetoothHFP, .bluetoothLE] : [.headsetMic]
        if let input = session.availableInputs?.first(where: { wanted.contains($0.portType) }) {
          try? session.setPreferredInput(input)
        }
      default:
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
      self.callKit.markJsReady()
    }

    Function("getPendingCalls") { () -> [[String: Any]] in
      return self.callKit.pendingCalls()
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
    }

    AsyncFunction("callKitStartOutgoing") { (record: ReportCallRecord, promise: Promise) in
      _ = self.callKit.startOutgoingCall(
        callSid: record.callSid, provider: record.provider, displayName: record.displayName,
        handle: record.handle, conversationId: record.conversationId, inboxId: record.inboxId
      ) { uuid, error in
        if let error { promise.reject("ERR_CALLKIT", error.localizedDescription) } else { promise.resolve(uuid.uuidString) }
      }
    }

    Function("callKitReportConnected") { (uuid: String) in
      guard let id = UUID(uuidString: uuid) else { return }
      self.callKit.reportConnected(uuid: id)
    }

    // Ends the system call for a reason outside the user's action on this device
    Function("callKitEndCall") { (uuid: String, reason: String) in
      guard let id = UUID(uuidString: uuid) else { return }
      self.callKit.endCall(uuid: id, reason: Self.endReasons[reason] ?? .remoteEnded)
    }

    // User actions from our own UI go through CallKit so the system state stays in step
    AsyncFunction("callKitRequestAnswer") { (uuid: String, promise: Promise) in
      guard let id = UUID(uuidString: uuid) else { return promise.reject("ERR_CALLKIT", "Invalid uuid") }
      self.callKit.requestAnswer(uuid: id) { error in
        if let error { promise.reject("ERR_CALLKIT", error.localizedDescription) } else { promise.resolve(nil) }
      }
    }

    AsyncFunction("callKitRequestEnd") { (uuid: String, promise: Promise) in
      guard let id = UUID(uuidString: uuid) else { return promise.reject("ERR_CALLKIT", "Invalid uuid") }
      self.callKit.requestEnd(uuid: id) { error in
        if let error { promise.reject("ERR_CALLKIT", error.localizedDescription) } else { promise.resolve(nil) }
      }
    }

    // Hold and resume for a call CallKit tracks; the held action then applies the change.
    // False when the call is not known to CallKit, so the caller holds the media itself.
    Function("holdCall") { (callSid: String) -> Bool in
      self.requestHeld(callSid: callSid, onHold: true)
    }

    Function("resumeCall") { (callSid: String) -> Bool in
      self.requestHeld(callSid: callSid, onHold: false)
    }

    AsyncFunction("callKitRequestMute") { (uuid: String, muted: Bool, promise: Promise) in
      guard let id = UUID(uuidString: uuid) else { return promise.reject("ERR_CALLKIT", "Invalid uuid") }
      self.callKit.requestMute(uuid: id, muted: muted) { error in
        if let error { promise.reject("ERR_CALLKIT", error.localizedDescription) } else { promise.resolve(nil) }
      }
    }
  }

  private func requestHeld(callSid: String, onHold: Bool) -> Bool {
    guard let tracked = callKit.call(forSid: callSid), tracked.answered || tracked.outgoing else { return false }
    callKit.requestHold(uuid: tracked.uuid, onHold: onHold) { _ in }
    return true
  }
}
