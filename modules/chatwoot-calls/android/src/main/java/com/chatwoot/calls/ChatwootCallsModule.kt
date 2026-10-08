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

  private val audioManager: AudioManager
    get() = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager

  private fun emitState(state: String, error: String? = null) {
    val payload = Bundle()
    payload.putString("state", state)
    if (error != null) payload.putString("error", error)
    sendEvent("onTwilioCallState", payload)
  }

  private fun releaseAudio() {
    audioManager.mode = AudioManager.MODE_NORMAL
    audioManager.isSpeakerphoneOn = false
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

    Events("onTwilioCallState", "onNativeCallAction", "onAudioRoute")

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
      TelecomCalls.onSystemAnswer = { callSid ->
        appContext.reactContext?.let { CallNotification.applySystemAction(it, "answer", callSid) }
      }
      TelecomCalls.onSystemHold = { _, held -> NativeCallBridge.emit("hold", held) }
      TelecomCalls.onSystemDisconnect = { callSid ->
        appContext.reactContext?.let { CallNotification.applySystemAction(it, "decline", callSid) }
        NativeCallBridge.emit("end", callSid = callSid)
      }
    }

    OnDestroy {
      NativeCallBridge.onAction = null
      TelecomCalls.onAudioRoute = null
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
      audioManager.mode = AudioManager.MODE_IN_COMMUNICATION
      val options = ConnectOptions.Builder(token).params(params).build()
      activeCall = Voice.connect(context, options, callListener)
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

    // Speaker routing: through Telecom while it tracks the call, otherwise directly
    Function("setSpeakerOn") { enabled: Boolean ->
      if (!TelecomCalls.setSpeaker(enabled)) audioManager.isSpeakerphoneOn = enabled
    }

    // Telecom owns audio mode, focus and routing for the calls it tracks
    Function("isTelecomAvailable") { ->
      TelecomCalls.supported
    }

    // A named route: speaker, earpiece, bluetooth or wired
    Function("setAudioRoute") { route: String ->
      if (!TelecomCalls.setRoute(route)) audioManager.isSpeakerphoneOn = route == "speaker"
    }

    Function("currentAudioRoute") { ->
      val (current, available, names) = TelecomCalls.currentRoute()
      mapOf("current" to current, "available" to available, "names" to names)
    }

    // Answer or decline pressed on the call notification before the app was running
    Function("takePendingCallAction") { callSid: String? ->
      CallNotification.takePendingAction(context, callSid)
    }

    Function("cancelCallNotification") { ->
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
      OngoingCallService.stop(context)
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

    Function("moveAppToBackground") { ->
      appContext.currentActivity?.let { activity ->
        activity.runOnUiThread { activity.moveTaskToBack(true) }
      }
    }
  }
}
