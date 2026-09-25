package com.chatwoot.calls

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

// Answer and decline from the call notification. The choice is stored and the app applies
// it: straight away when it is running, otherwise as soon as it starts, which for answer
// is immediately since the app is brought up.
class CallActionReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    if (intent.action == CallNotification.ACTION_HANG_UP) {
      // Hang up on the in-progress notification; the app is running whenever it shows
      NativeCallBridge.emit("end")
      OngoingCallService.stop(context)
      return
    }
    val callSid = intent.getStringExtra(CallNotification.EXTRA_CALL_SID) ?: return
    val callId = intent.getStringExtra(CallNotification.EXTRA_CALL_ID)
    val action = if (intent.action == CallNotification.ACTION_ANSWER) "answer" else "decline"

    val details = CallNotification.CallDetails(
      intent.getStringExtra(IncomingCallActivity.EXTRA_PROVIDER),
      intent.getStringExtra(IncomingCallActivity.EXTRA_CONVERSATION_ID),
      intent.getStringExtra(IncomingCallActivity.EXTRA_INBOX_ID),
      intent.getStringExtra(IncomingCallActivity.EXTRA_CALLER_NAME),
      intent.getStringExtra(IncomingCallActivity.EXTRA_CALLER_PHONE),
      intent.getStringExtra(IncomingCallActivity.EXTRA_CALLER_AVATAR)
    )
    CallNotification.storePendingAction(context, action, callSid, callId, details)
    CallNotification.cancel(context)
    // The stored choice is consumed once, whichever of the running app or the started
    // task gets to it first
    NativeCallBridge.emit("pending")
    CallSessionService.start(context, callSid, callId)

    if (action == "answer") {
      val launch = context.packageManager.getLaunchIntentForPackage(context.packageName)
      launch?.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
      launch?.let { context.startActivity(it) }
    }
  }
}
