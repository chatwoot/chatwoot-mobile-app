package com.chatwoot.calls

import android.app.Activity
import android.app.Application
import android.content.Context
import android.media.AudioManager
import android.os.Bundle
import com.twilio.voice.Call
import com.twilio.voice.CallException
import com.twilio.voice.ConnectOptions
import com.twilio.voice.Voice
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ChatwootCallsModule : Module() {
  private var activeCall: Call? = null

  private val context: Context
    get() = appContext.reactContext ?: throw IllegalStateException("React context is not available")

  private val appRinger by lazy { CallRinger(context.applicationContext) }
  private val appAudio by lazy { AppCallAudio(context.applicationContext) }
  private var twilioAudioToken: String? = null

  private val audioManager: AudioManager
    get() = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager

  private fun emitState(state: String, error: String? = null) {
    val payload = Bundle()
    payload.putString("state", state)
    if (error != null) payload.putString("error", error)
    sendEvent("onTwilioCallState", payload)
  }

  private fun releaseAudio() {
    if (AppCallAudio.supported) {
      twilioAudioToken?.let { appAudio.stop(it) }
      twilioAudioToken = null
      return
    }
    audioManager.mode = AudioManager.MODE_NORMAL
    if (!TelecomCalls.available) {
      audioManager.isSpeakerphoneOn = false
    }
  }

  // Receives Twilio call callbacks and forwards them as a single state event. Only the
  // current call reports; an earlier one ending late must not end the call that followed.
  private val callListener = object : Call.Listener {
    private fun current(call: Call) = call === activeCall

    override fun onRinging(call: Call) {
      if (current(call)) emitState("ringing")
    }

    override fun onConnected(call: Call) {
      if (current(call)) emitState("connected")
    }

    override fun onReconnecting(call: Call, callException: CallException) {
      if (current(call)) emitState("reconnecting", callException.message)
    }

    override fun onReconnected(call: Call) {
      if (current(call)) emitState("connected")
    }

    override fun onConnectFailure(call: Call, callException: CallException) {
      if (!current(call)) return
      activeCall = null
      releaseAudio()
      emitState("failed", callException.message)
    }

    override fun onDisconnected(call: Call, callException: CallException?) {
      if (!current(call)) return
      activeCall = null
      releaseAudio()
      emitState("disconnected", callException?.message)
    }
  }

  override fun definition() = ModuleDefinition {
    Name("ChatwootCalls")

    Events("onTwilioCallState", "onNativeCallAction", "onAudioRoute", "onTelecomUnavailable")

    OnCreate {
      AppVisibility.track(context.applicationContext as Application)
      NativeCallBridge.onAction = { action, enabled, callSid ->
        val payload = Bundle()
        payload.putString("action", action)
        if (enabled != null) payload.putBoolean("enabled", enabled)
        if (callSid != null) payload.putString("callSid", callSid)
        sendEvent("onNativeCallAction", payload)
      }
      TelecomCalls.onAudioRoute = { callSid, current, available, names ->
        try {
          sendEvent(
            "onAudioRoute",
            mapOf("callSid" to callSid, "current" to current, "available" to available, "names" to names)
          )
        } catch (e: Exception) {
          android.util.Log.w("ChatwootCalls", "audio route event not delivered: ${e.message}")
        }
      }
      if (AppCallAudio.supported) appAudio.onRoute = { current, available, names ->
        try {
          sendEvent("onAudioRoute", mapOf("current" to current, "available" to available, "names" to names))
        } catch (e: Exception) {
          android.util.Log.w("ChatwootCalls", "audio route event not delivered: ${e.message}")
        }
      }
      TelecomCalls.onRegistrationFailed = { callSid ->
        try {
          sendEvent("onTelecomUnavailable", mapOf("callSid" to callSid))
        } catch (e: Exception) {
          android.util.Log.w("ChatwootCalls", "Telecom failure not delivered: ${e.message}")
        }
      }
      TelecomCalls.onSystemAnswer = { callSid ->
        appContext.reactContext?.let { CallNotification.applySystemAction(it, "answer", callSid) }
      }
      TelecomCalls.onSystemHold = { _, held -> NativeCallBridge.emit("hold", held) }
      // A ring still on this phone is declined through the pending action; any other call
      // is ended by the app, or, before JavaScript listens, kept as an end for it
      TelecomCalls.onSystemDisconnect = { callSid ->
        val context = appContext.reactContext
        if (context != null && CallNotification.isRinging(callSid)) {
          CallNotification.applySystemAction(context, "decline", callSid)
        } else if (!NativeCallBridge.emit("end", callSid = callSid) && context != null) {
          CallNotification.storeEnd(context, callSid)
        }
      }
    }

    // Without the module, Telecom's answer and decline are kept as pending actions until
    // the next module attaches
    OnStartObserving("onNativeCallAction") {
      NativeCallBridge.listening = true
    }

    OnStopObserving("onNativeCallAction") {
      NativeCallBridge.listening = false
    }

    OnDestroy {
      if (AppCallAudio.supported) {
        appAudio.onRoute = null
        appAudio.destroy()
      }
      NativeCallBridge.listening = false
      NativeCallBridge.onAction = null
      TelecomCalls.onAudioRoute = null
      TelecomCalls.onSystemAnswer = null
      TelecomCalls.onSystemDisconnect = null
      TelecomCalls.onSystemHold = null
      TelecomCalls.onRegistrationFailed = null
    }

    // The lock-screen call screen hosts the app's views too; it is not the app in front
    OnActivityEntersForeground {
      if (appContext.currentActivity !is IncomingCallActivity) AppVisibility.foreground = true
    }

    // The in-progress notification was tapped: the app is up and the call screen is wanted
    OnNewIntent { intent ->
      if (intent.getBooleanExtra(OngoingCallService.EXTRA_OPEN_CALL, false)) {
        intent.removeExtra(OngoingCallService.EXTRA_OPEN_CALL)
        NativeCallBridge.emit("open")
      }
    }

    // The app left the front with a call still ringing in it: the ring moves to the phone
    OnActivityEntersBackground {
      AppVisibility.foreground = false
      if (CallNotification.showDeferred(context)) appRinger.stop()
    }

    // Dials into the Twilio conference through the TwiML app. `params` become the
    // TwiML request parameters (To, is_agent, conversation_id, call_sid).
    AsyncFunction("twilioConnect") { token: String, params: Map<String, String> ->
      activeCall?.disconnect()
      if (AppCallAudio.supported) twilioAudioToken = appAudio.start()
      else audioManager.mode = AudioManager.MODE_IN_COMMUNICATION
      val options = ConnectOptions.Builder(token).params(params).build()
      try {
        activeCall = Voice.connect(context, options, callListener)
      } catch (e: Exception) {
        if (AppCallAudio.supported) releaseAudio()
        throw e
      }
      emitState("connecting")
    }

    Function("twilioDisconnect") {
      activeCall?.disconnect()
      activeCall = null
      releaseAudio()
    }

    Function("twilioSetMuted") { muted: Boolean ->
      activeCall?.mute(muted)
    }

    Function("twilioSetHold") { hold: Boolean ->
      activeCall?.hold(hold)
    }

    // A ringback for a call this device placed, while the contact's phone rings
    Function("startRingback") { -> Ringback.start() }

    Function("stopRingback") { -> Ringback.stop() }

    Function("setSpeakerOn") { enabled: Boolean ->
      // A registering Telecom call keeps the choice until its endpoints arrive.
      if (AppCallAudio.supported) appAudio.setRoute(if (enabled) "speaker" else "default")
      else if (!TelecomCalls.setSpeaker(enabled)) audioManager.isSpeakerphoneOn = enabled
    }

    Function("hasNativeAudioRouting") { -> AppCallAudio.supported || TelecomCalls.available }

    Function("startAppCallAudio") { -> if (AppCallAudio.supported) appAudio.start() else null }

    Function("stopAppCallAudio") { token: String ->
      if (AppCallAudio.supported) appAudio.stop(token)
    }

    // Telecom owns audio mode, focus and routing for the calls it tracks
    Function("isTelecomAvailable") { ->
      TelecomCalls.available
    }

    // A named route: speaker, earpiece, bluetooth or wired
    Function("setAudioRoute") { route: String ->
      if (AppCallAudio.supported) appAudio.setRoute(route)
      else if (!TelecomCalls.setRoute(route)) audioManager.isSpeakerphoneOn = route == "speaker"
    }

    Function("currentAudioRoute") { ->
      val (current, available, names) = if (AppCallAudio.supported) appAudio.currentRoute() else TelecomCalls.currentRoute()
      mapOf("current" to current, "available" to available, "names" to names)
    }

    // Answer or decline pressed on the call notification before the app was running
    Function("takePendingCallAction") { callSid: String? ->
      CallNotification.takePendingAction(context, callSid)
    }

    // The app's own call UI replaces the ring notifications; the rings it shows are kept to
    // be posted again should it leave the front
    Function("cancelCallNotification") { keepRinging: List<String>? ->
      CallNotification.deferRinging(keepRinging.orEmpty())
      CallNotification.cancel(context)
    }

    // The native call screen follows the call the app is carrying behind it
    Function("reportCallState") { state: String, callSid: String? ->
      IncomingCallActivity.applyState(state, callSid)
    }

    // The persistent notification for a call in progress, held by a foreground service,
    // and the call's registration with Telecom
    Function("startOngoingCall") { callSid: String, name: String, handle: String, inboxName: String, avatar: String, state: String ->
      CallNotification.forgetRing(callSid)
      OngoingCallService.start(context, callSid, name, handle, inboxName, avatar, state)
      TelecomCalls.add(context, callSid, name, handle, outgoing = state == OngoingCallService.STATE_CALLING)
      if (state != OngoingCallService.STATE_CALLING) TelecomCalls.setActive(callSid)
    }

    Function("rememberCall") { callSid: String, details: Map<String, String> ->
      CallNotification.remember(callSid, details)
    }

    // An end for a call the app no longer has, after it reloaded: kept as a pending action
    // with the details remembered for the call, for the app to end it with the server
    Function("queueEnd") { callSid: String ->
      CallNotification.storePendingAction(
        context, "end", callSid, CallNotification.callIdFor(callSid),
        CallNotification.detailsFor(callSid) ?: CallNotification.CallDetails(null, null, null)
      )
    }

    // A ring that ended without becoming a call here is dropped from Telecom
    Function("markCallAnswering") { callSid: String ->
      CallNotification.forgetRing(callSid)
      TelecomCalls.markAnswering(callSid)
    }

    Function("abandonAnswer") { callSid: String ->
      CallNotification.forgetRing(callSid)
      TelecomCalls.abandonAnswer(callSid)
    }

    Function("endRingingCall") { callSid: String ->
      CallNotification.forgetRing(callSid)
      TelecomCalls.endRinging(callSid, "remote")
    }

    // Hold and resume through Telecom; false means the call is not registered there
    Function("holdCall") { callSid: String ->
      TelecomCalls.hold(callSid)
    }

    Function("resumeCall") { callSid: String ->
      TelecomCalls.resume(callSid)
    }

    Function("stopOngoingCall") { callSid: String, reason: String ->
      OngoingCallService.stop(context, callSid)
      TelecomCalls.end(callSid, reason)
    }

    // While the phone is locked the call screen may show, but nothing behind it may be
    // reached, so the app hides the controls that would navigate into it
    Function("isAppInForeground") { ->
      AppVisibility.foreground
    }

    Function("isDeviceLocked") { ->
      val keyguard = context.getSystemService(android.app.KeyguardManager::class.java)
      keyguard?.isKeyguardLocked ?: false
    }


    // The lock-screen call activity shows the app's call screen once it has a call to draw
    Function("setLockScreenCallSurfaceVisible") { visible: Boolean ->
      IncomingCallActivity.setCallScreenVisible(visible)
    }

    AsyncFunction("openAppFromLockScreen") { promise: expo.modules.kotlin.Promise ->
      IncomingCallActivity.openApp { opened -> promise.resolve(opened) }
    }

    // Android shows the frame saved when the app last left the foreground until the app
    // draws again. While a call is up that frame goes stale within a second, so it is
    // not saved. Needs Android 13; earlier versions keep the saved frame.
    Function("setRecentsScreenshotEnabled") { enabled: Boolean ->
      if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.TIRAMISU) {
        appContext.currentActivity?.let { activity ->
          activity.runOnUiThread { activity.setRecentsScreenshotEnabled(enabled) }
        }
      }
    }

    // The app was opened by a call and the call is over: step back off the lock screen
    // rather than leaving the app sitting on top of it
    // The phone's ringtone while a call rings with the app in front, the same ring the
    // native call screen uses
    Function("startAppRinger") { ->
      appRinger.stop()
      appRinger.start()
    }

    Function("stopAppRinger") { ->
      appRinger.stop()
    }

    // The lock-screen call screen closes itself or shows the next ring, so it is left alone
    Function("moveAppToBackground") { ->
      appContext.currentActivity?.takeUnless { it is IncomingCallActivity }?.let { activity ->
        activity.runOnUiThread { activity.moveTaskToBack(true) }
      }
    }
  }
}
