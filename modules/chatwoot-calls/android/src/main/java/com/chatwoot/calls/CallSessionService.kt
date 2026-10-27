package com.chatwoot.calls

import android.content.Context
import android.content.Intent
import android.os.Handler
import android.os.Looper
import com.facebook.react.HeadlessJsTaskService
import com.facebook.react.ReactApplication
import com.facebook.react.bridge.Arguments
import com.facebook.react.jstasks.HeadlessJsTaskConfig

class CallSessionService : HeadlessJsTaskService() {
  private val handler = Handler(Looper.getMainLooper())

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    val extras = intent?.extras ?: return START_NOT_STICKY
    acquireWakeLockNow(this)
    startWhenReady(HeadlessJsTaskConfig(TASK_KEY, Arguments.fromBundle(extras), 0, true), READY_ATTEMPTS)
    return START_NOT_STICKY
  }

  // Context availability precedes runnable React instances.
  private fun startWhenReady(config: HeadlessJsTaskConfig, attemptsLeft: Int) {
    val context = reactContext
    if (context != null && context.hasActiveReactInstance()) {
      startTask(config)
      return
    }
    if (context == null) warm(application)
    if (attemptsLeft > 0) {
      handler.postDelayed({ startWhenReady(config, attemptsLeft - 1) }, READY_POLL_MS)
    } else {
      stopSelf()
    }
  }

  companion object {
    const val TASK_KEY = "ChatwootCallSession"
    private const val READY_POLL_MS = 150L
    private const val READY_ATTEMPTS = 100

    fun start(context: Context, callSid: String, callId: String?) {
      val intent = Intent(context, CallSessionService::class.java)
        .putExtra(CallNotification.EXTRA_CALL_SID, callSid)
        .putExtra(CallNotification.EXTRA_CALL_ID, callId)
      context.startService(intent)
    }

    fun warm(context: Context) {
      runCatching {
        (context.applicationContext as? ReactApplication)?.reactHost?.start()
      }
    }
  }
}
