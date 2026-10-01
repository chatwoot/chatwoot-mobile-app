package com.chatwoot.calls

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

// Decline on the call notification, the notification swiped away, Answer while the phone
// is locked, and Hang up on the in-progress one. A decline is stored and the app applies
// it: straight away when it is running, otherwise as soon as it starts. Answer with the
// phone unlocked opens an activity directly and does not come through here.
class CallActionReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    if (intent.action == CallNotification.ACTION_HANG_UP) {
      // Hang up on the in-progress notification; the app is running whenever it shows
      NativeCallBridge.emit("end", callSid = intent.getStringExtra(CallNotification.EXTRA_CALL_SID))
      OngoingCallService.stop(context)
      return
    }
    val callSid = intent.getStringExtra(CallNotification.EXTRA_CALL_SID) ?: return
    if (intent.action == CallNotification.ACTION_ANSWER) {
      // The ring screen answers its own call; another call takes the screen, answering.
      // The ring screen is showing, so the app may open an activity from here.
      if (IncomingCallActivity.applySystemAction(callSid, "answer")) return
      context.startActivity(
        Intent(intent)
          .setAction(null)
          .setClass(context, IncomingCallActivity::class.java)
          .setFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
          .putExtra(IncomingCallActivity.EXTRA_ANSWER, true)
      )
      return
    }
    if (intent.action == CallNotification.ACTION_DISMISS) {
      // The agent silenced the ring; the caller and the agent's other devices keep ringing
      CallNotification.forgetRing(callSid)
      TelecomCalls.endRinging(callSid, "missed")
      NativeCallBridge.emit("dismissed", callSid = callSid)
      return
    }
    val callId = intent.getStringExtra(CallNotification.EXTRA_CALL_ID)
    if (intent.action != CallNotification.ACTION_DECLINE) return
    val action = "decline"

    val details = CallNotification.CallDetails(
      intent.getStringExtra(IncomingCallActivity.EXTRA_PROVIDER),
      intent.getStringExtra(IncomingCallActivity.EXTRA_CONVERSATION_ID),
      intent.getStringExtra(IncomingCallActivity.EXTRA_INBOX_ID),
      intent.getStringExtra(IncomingCallActivity.EXTRA_CALLER_NAME),
      intent.getStringExtra(IncomingCallActivity.EXTRA_CALLER_PHONE),
      intent.getStringExtra(IncomingCallActivity.EXTRA_CALLER_AVATAR),
      intent.getStringExtra(IncomingCallActivity.EXTRA_ACCOUNT_ID)
    )
    CallNotification.storePendingAction(context, action, callSid, callId, details)
    CallNotification.forgetRing(callSid)
    CallNotification.cancel(context, callSid)
    IncomingCallActivity.cancelRinging(callSid)
    // The stored choice is consumed once, whichever of the running app or the started
    // task gets to it first
    NativeCallBridge.emit("pending")
    CallSessionService.start(context, callSid, callId)
  }
}
