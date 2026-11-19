package com.chatwoot.calls

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class CallActionReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    if (intent.action == CallNotification.ACTION_HANG_UP) {
      val hungUpSid = intent.getStringExtra(CallNotification.EXTRA_CALL_SID)
      if (!NativeCallBridge.emit("end", callSid = hungUpSid) && hungUpSid != null) {
        CallNotification.storeEnd(context, hungUpSid)
      }
      OngoingCallService.stop(context, hungUpSid)
      return
    }
    val callSid = intent.getStringExtra(CallNotification.EXTRA_CALL_SID) ?: return
    if (intent.action == CallNotification.ACTION_ANSWER) {
      // Visible call screens permit activity launches.
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
      // Dismissal silences only this device.
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
    // Native actions are consumed once.
    NativeCallBridge.emit("pending")
    CallSessionService.start(context, callSid, callId)
  }
}
