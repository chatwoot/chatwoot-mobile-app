package com.chatwoot.calls

import android.app.Activity
import android.content.Intent
import android.os.Build
import android.os.Bundle

// Answer on the call notification. Draws nothing: over the lock screen it hands the call to
// the ring screen, which carries it there; otherwise it stores the answer and brings the
// app up, which opens straight onto its call screen.
class CallAnswerActivity : Activity() {

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) setShowWhenLocked(true)
    val callSid = intent.getStringExtra(CallNotification.EXTRA_CALL_SID)
    if (!callSid.isNullOrBlank()) answer(callSid)
    finish()
    @Suppress("DEPRECATION")
    overridePendingTransition(0, 0)
  }

  private fun answer(callSid: String) {
    // The ring screen already showing this call answers it itself
    if (IncomingCallActivity.applySystemAction(callSid, "answer")) return
    val locked = getSystemService(android.app.KeyguardManager::class.java)?.isKeyguardLocked ?: false
    if (locked) {
      startActivity(
        Intent(intent)
          .setClass(this, IncomingCallActivity::class.java)
          .setFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
          .putExtra(IncomingCallActivity.EXTRA_ANSWER, true)
      )
      return
    }
    val details = CallNotification.CallDetails(
      intent.getStringExtra(IncomingCallActivity.EXTRA_PROVIDER),
      intent.getStringExtra(IncomingCallActivity.EXTRA_CONVERSATION_ID),
      intent.getStringExtra(IncomingCallActivity.EXTRA_INBOX_ID),
      intent.getStringExtra(IncomingCallActivity.EXTRA_CALLER_NAME),
      intent.getStringExtra(IncomingCallActivity.EXTRA_CALLER_PHONE),
      intent.getStringExtra(IncomingCallActivity.EXTRA_CALLER_AVATAR),
      intent.getStringExtra(IncomingCallActivity.EXTRA_ACCOUNT_ID)
    )
    CallNotification.forgetRing(callSid)
    CallNotification.storePendingAction(
      this, "answer", callSid, intent.getStringExtra(CallNotification.EXTRA_CALL_ID), details
    )
    CallNotification.cancel(this, callSid)
    // A running app answers at once; a starting one reads the stored answer as it opens
    NativeCallBridge.emit("pending")
    packageManager.getLaunchIntentForPackage(packageName)?.let { launch ->
      launch.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_REORDER_TO_FRONT)
      startActivity(launch)
    }
  }
}
