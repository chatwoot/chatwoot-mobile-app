import AVFoundation
import CallKit
import Foundation
import PushKit

// Report PushKit calls before JavaScript starts.
final class CallKitManager: NSObject {
  static let shared = CallKitManager()

  struct TrackedCall {
    let uuid: UUID
    let callSid: String
    var callId: Int?
    let provider: String
    let conversationId: Int?
    let inboxId: Int?
    var accountId: Int?
    let displayName: String
    let handle: String
    var outgoing: Bool
    var answered: Bool
    var ringTimer: Timer?
    var callerName: String? = nil

    var payload: [String: Any] {
      var result: [String: Any] = [
        "uuid": uuid.uuidString,
        "callSid": callSid,
        "provider": provider,
        "displayName": displayName,
        "handle": handle,
        "outgoing": outgoing,
        "answered": answered,
      ]
      if let callId { result["callId"] = callId }
      if let conversationId { result["conversationId"] = conversationId }
      if let inboxId { result["inboxId"] = inboxId }
      if let accountId { result["accountId"] = accountId }
      if let callerName { result["callerName"] = callerName }
      return result
    }
  }

  var emit: ((String, [String: Any]) -> Void)?
  var prepareAudioSession: ((String) -> Void)?
  // Release media even without JavaScript.
  var endMedia: ((String, String?) -> Void)?
  var audioSessionDidActivate: ((AVAudioSession, String) -> Void)?
  var audioSessionDidDeactivate: ((AVAudioSession, String) -> Void)?

  private(set) var calls: [UUID: TrackedCall] = [:]
  private(set) var voipToken: String?
  private var activeAudioSession: AVAudioSession?
  private var bufferedEvents: [(String, [String: Any])] = []
  private var jsReady = false

  private let provider: CXProvider
  private let callController = CXCallController()
  private let callObserver = CXCallObserver()
  private var pushRegistry: PKPushRegistry?
  private var heldBySystem: Set<UUID> = []
  // Suppress late pushes for ended calls.
  private var endedSids: [String: Date] = [:]
  private static let endedSidMemory: TimeInterval = 120
  private static let signedInKey = "chatwoot.calls.signedIn"

  var signedIn: Bool {
    get { UserDefaults.standard.object(forKey: Self.signedInKey) as? Bool ?? true }
    set { UserDefaults.standard.set(newValue, forKey: Self.signedInKey) }
  }
  private var holdRequestedHere: Set<UUID> = []

  // Match the server's unanswered-ring deadline.
  private static let ringTimeout: TimeInterval = 60

  private override init() {
    let configuration = CXProviderConfiguration()
    configuration.supportsVideo = false
    // Call waiting requires two call groups.
    configuration.maximumCallGroups = 2
    configuration.maximumCallsPerCallGroup = 1
    configuration.supportedHandleTypes = [.generic, .phoneNumber]
    configuration.includesCallsInRecents = true
    configuration.iconTemplateImageData = Self.iconTemplateData()
    provider = CXProvider(configuration: configuration)
    super.init()
    provider.setDelegate(self, queue: nil)
    callObserver.setDelegate(self, queue: nil)
  }

  private static func iconTemplateData() -> Data? {
    let bundle = Bundle(for: CallKitManager.self)
    let resourceBundle = bundle.url(forResource: "ChatwootCallsResources", withExtension: "bundle")
      .flatMap(Bundle.init(url:)) ?? bundle
    guard let url = resourceBundle.url(forResource: "CallKitIcon", withExtension: "png") else { return nil }
    return try? Data(contentsOf: url)
  }

  func start() {
    guard pushRegistry == nil else { return }
    let registry = PKPushRegistry(queue: .main)
    registry.delegate = self
    registry.desiredPushTypes = [.voIP]
    pushRegistry = registry
  }


  private func send(_ name: String, _ body: [String: Any]) {
    if jsReady, let emit {
      emit(name, body)
    } else {
      bufferedEvents.append((name, body))
    }
  }

  func replayAudioSessionIfActive() {
    guard let session = activeAudioSession else { return }
    let providerName = audioProvider
    prepareAudioSession?(providerName)
    audioSessionDidActivate?(session, providerName)
  }

  func markJsUnready() {
    jsReady = false
    emit = nil
  }

  func markJsReady() {
    jsReady = true
    let pending = bufferedEvents
    bufferedEvents = []
    pending.forEach { emit?($0.0, $0.1) }
  }

  func pendingCalls() -> [[String: Any]] {
    calls.values.map { $0.payload }
  }

  func call(forSid callSid: String) -> TrackedCall? {
    calls.values.first { $0.callSid == callSid }
  }

  private var audioProvider: String {
    (calls.values.first { $0.answered || $0.outgoing } ?? calls.values.first)?.provider ?? ""
  }


  func reportIncomingCall(
    callSid: String, provider providerName: String, displayName: String, handle: String,
    conversationId: Int?, inboxId: Int?, accountId: Int?, callerName: String? = nil,
    callId: Int? = nil, completion: @escaping (UUID, Error?) -> Void
  ) -> UUID {
    if var existing = call(forSid: callSid) {
      if existing.accountId == nil, let accountId { existing.accountId = accountId }
      if existing.callId == nil, let callId { existing.callId = callId }
      calls[existing.uuid] = existing
      completion(existing.uuid, nil)
      return existing.uuid
    }
    let uuid = UUID()
    var tracked = TrackedCall(
      uuid: uuid, callSid: callSid, provider: providerName, conversationId: conversationId,
      inboxId: inboxId, accountId: accountId, displayName: displayName, handle: handle,
      outgoing: false, answered: false, ringTimer: nil, callerName: callerName)
    if tracked.callId == nil { tracked.callId = callId }
    let timeout = Self.ringTimeout
    tracked.ringTimer = Timer.scheduledTimer(withTimeInterval: timeout, repeats: false) { [weak self] _ in
      self?.endCall(uuid: uuid, reason: .unanswered)
    }
    calls[uuid] = tracked

    let update = CXCallUpdate()
    update.remoteHandle = CXHandle(type: handle.hasPrefix("+") ? .phoneNumber : .generic, value: handle)
    update.localizedCallerName = displayName
    update.hasVideo = false
    update.supportsGrouping = false
    update.supportsUngrouping = false
    update.supportsHolding = true
    update.supportsDTMF = false
    provider.reportNewIncomingCall(with: uuid, update: update) { [weak self] error in
      if let error {
        self?.calls[uuid]?.ringTimer?.invalidate()
        self?.calls[uuid] = nil
      }
      completion(uuid, error)
    }
    return uuid
  }

  func startOutgoingCall(
    callSid: String, provider providerName: String, displayName: String, handle: String,
    conversationId: Int?, inboxId: Int?, accountId: Int?, callId: Int?,
    completion: @escaping (UUID, Error?) -> Void
  ) -> UUID {
    let uuid = UUID()
    var tracked = TrackedCall(
      uuid: uuid, callSid: callSid, provider: providerName, conversationId: conversationId,
      inboxId: inboxId, accountId: accountId, displayName: displayName, handle: handle,
      outgoing: true, answered: false, ringTimer: nil)
    tracked.callId = callId
    calls[uuid] = tracked
    let cxHandle = CXHandle(type: handle.hasPrefix("+") ? .phoneNumber : .generic, value: handle)
    let action = CXStartCallAction(call: uuid, handle: cxHandle)
    action.contactIdentifier = displayName
    callController.request(CXTransaction(action: action)) { [weak self] error in
      if let error {
        self?.calls[uuid] = nil
      } else {
        self?.provider.reportOutgoingCall(with: uuid, startedConnectingAt: Date())
        // Outgoing capabilities require a separate update.
        let update = CXCallUpdate()
        update.supportsHolding = true
        update.supportsGrouping = false
        update.supportsUngrouping = false
        update.supportsDTMF = false
        self?.provider.reportCall(with: uuid, updated: update)
      }
      completion(uuid, error)
    }
    return uuid
  }

  func reportConnected(uuid: UUID) {
    guard var tracked = calls[uuid] else { return }
    tracked.ringTimer?.invalidate()
    tracked.ringTimer = nil
    tracked.answered = true
    calls[uuid] = tracked
    if tracked.outgoing {
      provider.reportOutgoingCall(with: uuid, connectedAt: Date())
    }
  }

  func endCall(uuid: UUID, reason: CXCallEndedReason) {
    guard let tracked = calls[uuid] else { return }
    tracked.ringTimer?.invalidate()
    calls[uuid] = nil
    rememberEnded(tracked.callSid)
    heldBySystem.remove(uuid)
    holdRequestedHere.remove(uuid)
    provider.reportCall(with: uuid, endedAt: Date(), reason: reason)
    send("onCallKitAction", ["type": "ended", "uuid": uuid.uuidString, "callSid": tracked.callSid])
  }

  func requestEnd(uuid: UUID, completion: @escaping (Error?) -> Void) {
    callController.request(CXTransaction(action: CXEndCallAction(call: uuid)), completion: completion)
  }

  func requestAnswer(uuid: UUID, completion: @escaping (Error?) -> Void) {
    callController.request(CXTransaction(action: CXAnswerCallAction(call: uuid)), completion: completion)
  }

  func requestMute(uuid: UUID, muted: Bool, completion: @escaping (Error?) -> Void) {
    callController.request(
      CXTransaction(action: CXSetMutedCallAction(call: uuid, muted: muted)), completion: completion)
  }

  // Local and system holds share callbacks.
  func requestHold(uuid: UUID, onHold: Bool, completion: @escaping (Error?) -> Void) {
    if onHold { holdRequestedHere.insert(uuid) }
    callController.request(CXTransaction(action: CXSetHeldCallAction(call: uuid, onHold: onHold))) { [weak self] error in
      // Rejected holds produce no action callback.
      if error != nil, onHold {
        DispatchQueue.main.async { self?.holdRequestedHere.remove(uuid) }
      }
      completion(error)
    }
  }

  private func rememberEnded(_ callSid: String) {
    let now = Date()
    endedSids = endedSids.filter { now.timeIntervalSince($0.value) < Self.endedSidMemory }
    endedSids[callSid] = now
  }

  private func endedRecently(_ callSid: String) -> Bool {
    guard let at = endedSids[callSid] else { return false }
    return Date().timeIntervalSince(at) < Self.endedSidMemory
  }

  private var otherCallActive: Bool {
    callObserver.calls.contains { !$0.hasEnded && calls[$0.uuid] == nil }
  }


  private func handleIncomingPush(_ dictionary: [AnyHashable: Any], completion: @escaping () -> Void) {
    let callSid = dictionary["call_id"] as? String ?? UUID().uuidString
    let providerName = dictionary["provider"] as? String ?? "whatsapp"
    // PushKit requires reporting while signed out.
    let caller = signedIn ? dictionary["caller"] as? [String: Any] ?? [:] : [:]
    let callerName = caller["name"] as? String ?? (signedIn ? "Unknown caller" : "Chatwoot")
    let inboxName = signedIn ? dictionary["inbox_name"] as? String ?? "" : ""
    let displayName = inboxName.isEmpty ? callerName : "\(callerName) · \(inboxName)"
    let handle = caller["phone"] as? String ?? callerName
    let pushType = dictionary["type"] as? String ?? "voice_call.incoming"
    let type = endedRecently(callSid) || !signedIn ? "voice_call.cancel" : pushType

    if type == "voice_call.cancel" {
      // Cancel pushes still require CallKit reporting.
      if let existing = call(forSid: callSid) {
        if !existing.answered && !existing.outgoing {
          endCall(uuid: existing.uuid, reason: cancelReason(dictionary["reason"] as? String ?? dictionary["status"] as? String))
        }
        completion()
        return
      }
    }

    let uuid = reportIncomingCall(
      callSid: callSid, provider: providerName, displayName: displayName, handle: handle,
      conversationId: Self.intValue(dictionary["conversation_id"]),
      inboxId: Self.intValue(dictionary["inbox_id"]),
      accountId: Self.intValue(dictionary["account_id"]),
      callerName: caller["name"] as? String
    ) { [weak self] reported, error in
      guard let self else { return completion() }
      if error == nil {
        if self.calls[reported]?.callId == nil {
          self.calls[reported]?.callId = Self.intValue(dictionary["id"])
        }
        if type == "voice_call.cancel" {
          self.endCall(uuid: reported, reason: self.cancelReason(dictionary["reason"] as? String ?? dictionary["status"] as? String))
        } else if let tracked = self.calls[reported] {
          self.send("onIncomingCall", tracked.payload)
        }
      }
      completion()
    }
    if calls[uuid]?.callId == nil { calls[uuid]?.callId = Self.intValue(dictionary["id"]) }
  }

  private func cancelReason(_ status: String?) -> CXCallEndedReason {
    switch status {
    case "in-progress", "in_progress", "completed": return .answeredElsewhere
    case "rejected": return .declinedElsewhere
    case "no-answer", "no_answer": return .unanswered
    default: return .remoteEnded
    }
  }

  private static func intValue(_ value: Any?) -> Int? {
    if let int = value as? Int { return int }
    if let string = value as? String { return Int(string) }
    if let number = value as? NSNumber { return number.intValue }
    return nil
  }
}


extension CallKitManager: CXProviderDelegate {
  func providerDidReset(_ provider: CXProvider) {
    calls.values.forEach { $0.ringTimer?.invalidate() }
    Set(calls.values.filter { $0.answered || $0.outgoing }.map { $0.provider }).forEach { endMedia?($0, nil) }
    calls.values.forEach { rememberEnded($0.callSid) }
    calls = [:]
    heldBySystem.removeAll()
    holdRequestedHere.removeAll()
    send("onCallKitAction", ["type": "reset"])
  }

  func provider(_ provider: CXProvider, perform action: CXAnswerCallAction) {
    guard var tracked = calls[action.callUUID] else {
      action.fail()
      return
    }
    tracked.answered = true
    tracked.ringTimer?.invalidate()
    tracked.ringTimer = nil
    calls[action.callUUID] = tracked
    prepareAudioSession?(tracked.provider)
    // Active sessions receive no second activation.
    if let session = activeAudioSession { audioSessionDidActivate?(session, tracked.provider) }
    send("onCallKitAction", ["type": "answer", "uuid": action.callUUID.uuidString, "callSid": tracked.callSid])
    action.fulfill()
  }

  func provider(_ provider: CXProvider, perform action: CXEndCallAction) {
    guard let tracked = calls[action.callUUID] else {
      action.fail()
      return
    }
    tracked.ringTimer?.invalidate()
    calls[action.callUUID] = nil
    rememberEnded(tracked.callSid)
    heldBySystem.remove(action.callUUID)
    holdRequestedHere.remove(action.callUUID)
    // Outgoing media starts before contact answers.
    if tracked.answered || tracked.outgoing { endMedia?(tracked.provider, tracked.callSid) }
    var event = tracked.payload
    event["type"] = "end"
    send("onCallKitAction", event)
    action.fulfill()
  }

  func provider(_ provider: CXProvider, perform action: CXStartCallAction) {
    guard let tracked = calls[action.callUUID] else {
      action.fail()
      return
    }
    prepareAudioSession?(tracked.provider)
    send("onCallKitAction", ["type": "start", "uuid": action.callUUID.uuidString, "callSid": tracked.callSid])
    action.fulfill()
  }

  func provider(_ provider: CXProvider, perform action: CXSetMutedCallAction) {
    guard let tracked = calls[action.callUUID] else {
      action.fail()
      return
    }
    send("onCallKitAction", [
      "type": "mute", "uuid": action.callUUID.uuidString, "callSid": tracked.callSid, "muted": action.isMuted,
    ])
    action.fulfill()
  }

  func provider(_ provider: CXProvider, perform action: CXSetHeldCallAction) {
    guard let tracked = calls[action.callUUID] else {
      action.fail()
      return
    }
    if action.isOnHold {
      if holdRequestedHere.remove(action.callUUID) == nil && otherCallActive {
        heldBySystem.insert(action.callUUID)
      }
    } else {
      heldBySystem.remove(action.callUUID)
      holdRequestedHere.remove(action.callUUID)
    }
    send("onCallKitAction", [
      "type": "hold", "uuid": action.callUUID.uuidString, "callSid": tracked.callSid, "onHold": action.isOnHold,
    ])
    action.fulfill()
  }

  func provider(_ provider: CXProvider, didActivate audioSession: AVAudioSession) {
    activeAudioSession = audioSession
    let providerName = audioProvider
    audioSessionDidActivate?(audioSession, providerName)
    send("onAudioSession", ["active": true, "provider": providerName])
  }

  func provider(_ provider: CXProvider, didDeactivate audioSession: AVAudioSession) {
    activeAudioSession = nil
    let providerName = audioProvider
    audioSessionDidDeactivate?(audioSession, providerName)
    send("onAudioSession", ["active": false, "provider": providerName])
  }
}


extension CallKitManager: CXCallObserverDelegate {
  func callObserver(_ callObserver: CXCallObserver, callChanged call: CXCall) {
    guard call.hasEnded, calls[call.uuid] == nil, !otherCallActive else { return }
    heldBySystem.forEach { uuid in requestHold(uuid: uuid, onHold: false) { _ in } }
  }
}


extension CallKitManager: PKPushRegistryDelegate {
  func pushRegistry(_ registry: PKPushRegistry, didUpdate pushCredentials: PKPushCredentials, for type: PKPushType) {
    let token = pushCredentials.token.map { String(format: "%02x", $0) }.joined()
    voipToken = token
    send("onVoipToken", ["token": token])
  }

  func pushRegistry(_ registry: PKPushRegistry, didInvalidatePushTokenFor type: PKPushType) {
    voipToken = nil
    send("onVoipToken", ["token": NSNull()])
  }

  func pushRegistry(
    _ registry: PKPushRegistry, didReceiveIncomingPushWith payload: PKPushPayload,
    for type: PKPushType, completion: @escaping () -> Void
  ) {
    handleIncomingPush(payload.dictionaryPayload, completion: completion)
  }
}
