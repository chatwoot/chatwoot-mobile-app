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
      TelecomCalls.onSystemHold = { callSid, held -> NativeCallBridge.emit("hold", held, callSid = callSid) }
      TelecomCalls.onSystemDisconnect = { callSid ->
        val context = appContext.reactContext
        if (context != null && CallNotification.isRinging(callSid)) {
          CallNotification.applySystemAction(context, "decline", callSid)
        } else if (!NativeCallBridge.emit("end", callSid = callSid) && context != null) {
          CallNotification.storeEnd(context, callSid)
        }
      }
    }

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

    OnActivityEntersForeground {
      if (appContext.currentActivity !is IncomingCallActivity) AppVisibility.foreground = true
    }

    OnNewIntent { intent ->
      if (intent.getBooleanExtra(OngoingCallService.EXTRA_OPEN_CALL, false)) {
        intent.removeExtra(OngoingCallService.EXTRA_OPEN_CALL)
        NativeCallBridge.emit("open")
      }
    }

    OnActivityEntersBackground {
      AppVisibility.foreground = false
      if (CallNotification.showDeferred(context)) appRinger.stop()
    }

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

    Function("startRingback") { -> Ringback.start() }

    Function("stopRingback") { -> Ringback.stop() }

    Function("setSpeakerOn") { enabled: Boolean ->
      if (AppCallAudio.supported) appAudio.setRoute(if (enabled) "speaker" else "default")
      else if (!TelecomCalls.setSpeaker(enabled)) audioManager.isSpeakerphoneOn = enabled
    }

    Function("hasNativeAudioRouting") { -> AppCallAudio.supported || TelecomCalls.available }

    Function("startAppCallAudio") { -> if (AppCallAudio.supported) appAudio.start() else null }

    Function("stopAppCallAudio") { token: String ->
      if (AppCallAudio.supported) appAudio.stop(token)
    }

    Function("isTelecomAvailable") { ->
      TelecomCalls.available
    }

    Function("setAudioRoute") { route: String ->
      if (AppCallAudio.supported) appAudio.setRoute(route)
      else if (!TelecomCalls.setRoute(route)) audioManager.isSpeakerphoneOn = route == "speaker"
    }

    Function("currentAudioRoute") { ->
      val (current, available, names) = if (AppCallAudio.supported) appAudio.currentRoute() else TelecomCalls.currentRoute()
      mapOf("current" to current, "available" to available, "names" to names)
    }

    Function("takePendingCallAction") { callSid: String? ->
      CallNotification.takePendingAction(context, callSid)
    }

    Function("cancelCallNotification") { keepRinging: List<String>? ->
      CallNotification.deferRinging(keepRinging.orEmpty())
      CallNotification.cancel(context)
    }

    Function("reportCallState") { state: String, callSid: String? ->
      IncomingCallActivity.applyState(state, callSid)
    }

    Function("startOngoingCall") { callSid: String, name: String, handle: String, inboxName: String, avatar: String, state: String ->
      CallNotification.forgetRing(callSid)
      OngoingCallService.start(context, callSid, name, handle, inboxName, avatar, state)
      TelecomCalls.add(context, callSid, name, handle, outgoing = state == OngoingCallService.STATE_CALLING)
      if (state != OngoingCallService.STATE_CALLING) TelecomCalls.setActive(callSid)
    }

    Function("setSignedIn") { signedIn: Boolean ->
      CallSession.setSignedIn(context, signedIn)
    }

    Function("rememberCall") { callSid: String, details: Map<String, String> ->
      CallNotification.remember(callSid, details)
    }

    Function("queueEnd") { callSid: String ->
      CallNotification.storePendingAction(
        context, "end", callSid, CallNotification.callIdFor(callSid),
        CallNotification.detailsFor(callSid) ?: CallNotification.CallDetails(null, null, null)
      )
    }

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

    Function("isAppInForeground") { ->
      AppVisibility.foreground
    }

    Function("isDeviceLocked") { ->
      val keyguard = context.getSystemService(android.app.KeyguardManager::class.java)
      keyguard?.isKeyguardLocked ?: false
    }


    Function("setLockScreenCallSurfaceVisible") { visible: Boolean ->
      IncomingCallActivity.setCallScreenVisible(visible)
    }

    AsyncFunction("openAppFromLockScreen") { promise: expo.modules.kotlin.Promise ->
      IncomingCallActivity.openApp { opened -> promise.resolve(opened) }
    }

    // Task snapshots become stale during calls.
    Function("setRecentsScreenshotEnabled") { enabled: Boolean ->
      if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.TIRAMISU) {
        appContext.currentActivity?.let { activity ->
          activity.runOnUiThread { activity.setRecentsScreenshotEnabled(enabled) }
        }
      }
    }

    Function("startAppRinger") { ->
      appRinger.stop()
      appRinger.start()
    }

    Function("stopAppRinger") { ->
      appRinger.stop()
    }

    // Lock-screen activities manage their own dismissal.
    Function("moveAppToBackground") { ->
      appContext.currentActivity?.takeUnless { it is IncomingCallActivity }?.let { activity ->
        activity.runOnUiThread { activity.moveTaskToBack(true) }
      }
    }
  }
}
