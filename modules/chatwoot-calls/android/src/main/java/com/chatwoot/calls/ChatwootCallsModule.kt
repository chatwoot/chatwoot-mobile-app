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

  // Receives Twilio call callbacks and forwards them as a single state event
  private val callListener = object : Call.Listener {
    override fun onRinging(call: Call) = emitState("ringing")

    override fun onConnected(call: Call) = emitState("connected")

    override fun onReconnecting(call: Call, callException: CallException) =
      emitState("reconnecting", callException.message)

    override fun onReconnected(call: Call) = emitState("connected")

    override fun onConnectFailure(call: Call, callException: CallException) {
      activeCall = null
      releaseAudio()
      emitState("failed", callException.message)
    }

    override fun onDisconnected(call: Call, callException: CallException?) {
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
      NativeCallBridge.onAction = { action, enabled ->
        val payload = Bundle()
        payload.putString("action", action)
        if (enabled != null) payload.putBoolean("enabled", enabled)
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
        NativeCallBridge.emit("end")
      }
    }

    OnDestroy {
      NativeCallBridge.onAction = null
      TelecomCalls.onAudioRoute = null
    }

    OnActivityEntersForeground {
      AppVisibility.foreground = true
    }

    // The in-progress notification was tapped: the app is up and the call screen is wanted
    OnNewIntent { intent ->
      if (intent.getBooleanExtra(OngoingCallService.EXTRA_OPEN_CALL, false)) {
        intent.removeExtra(OngoingCallService.EXTRA_OPEN_CALL)
        NativeCallBridge.emit("open")
      }
    }

    OnActivityEntersBackground {
      AppVisibility.foreground = false
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

    Function("twilioIsConnected") {
      activeCall?.state == Call.State.CONNECTED
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
    Function("takePendingCallAction") { ->
      val prefs = context.getSharedPreferences(CallNotification.PREFS, Context.MODE_PRIVATE)
      val pending = prefs.getString(CallNotification.PENDING_ACTION_KEY, null)
      prefs.edit().remove(CallNotification.PENDING_ACTION_KEY).apply()
      pending
    }

    Function("cancelCallNotification") { ->
      CallNotification.cancel(context)
    }

    // The native call screen follows the call the app is carrying behind it
    Function("reportCallState") { state: String ->
      IncomingCallActivity.applyState(state)
    }

    Function("dismissIncomingCallUi") { ->
      IncomingCallActivity.dismiss()
    }

    // The persistent notification for a call in progress, held by a foreground service,
    // and the call's registration with Telecom
    Function("startOngoingCall") { callSid: String, name: String, handle: String, inboxName: String, avatar: String, state: String ->
      OngoingCallService.start(context, name, handle, inboxName, avatar, state)
      TelecomCalls.add(context, callSid, name, handle, outgoing = state == OngoingCallService.STATE_CALLING)
      if (state != OngoingCallService.STATE_CALLING) TelecomCalls.setActive(callSid)
    }

    // A ring that ended without becoming a call here is dropped from Telecom
    Function("markCallAnswering") { callSid: String ->
      TelecomCalls.markAnswering(callSid)
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
    Function("isDeviceLocked") { ->
      val keyguard = context.getSystemService(android.app.KeyguardManager::class.java)
      keyguard?.isKeyguardLocked ?: false
    }


    // The lock-screen call activity shows the app's call screen once it has a call to draw
    Function("setLockScreenCallSurfaceVisible") { visible: Boolean ->
      IncomingCallActivity.setCallScreenVisible(visible)
    }

    Function("openAppFromLockScreen") {
      IncomingCallActivity.openApp()
    }

    // The app was opened by a call and the call is over: step back off the lock screen
    // rather than leaving the app sitting on top of it
    Function("moveAppToBackground") { ->
      appContext.currentActivity?.let { activity ->
        activity.runOnUiThread { activity.moveTaskToBack(true) }
      }
    }
  }
}
