package com.chatwoot.calls

import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.app.Person
import androidx.core.app.ServiceCompat
import androidx.core.graphics.drawable.IconCompat

// Holds a call in progress as a foreground service, which keeps the microphone available
// while the app is in the background and gives the agent a persistent notification with
// Hang up and a way back to the call screen.
class OngoingCallService : Service() {
  override fun onBind(intent: Intent?): IBinder? = null

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    val name = intent?.getStringExtra(EXTRA_NAME).takeUnless { it.isNullOrBlank() } ?: "Call"
    val handle = intent?.getStringExtra(EXTRA_HANDLE).orEmpty()
    val inboxName = intent?.getStringExtra(EXTRA_INBOX_NAME).orEmpty()
    val avatar = intent?.getStringExtra(EXTRA_AVATAR)
    val calling = intent?.getStringExtra(EXTRA_STATE) == STATE_CALLING
    val type = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      ServiceInfo.FOREGROUND_SERVICE_TYPE_MICROPHONE
    } else {
      0
    }
    ServiceCompat.startForeground(this, NOTIFICATION_ID, notification(name, handle, inboxName, calling, null), type)
    ContactPhoto.fetchAsync(avatar) { photo ->
      NotificationManagerCompat.from(this).notify(NOTIFICATION_ID, notification(name, handle, inboxName, calling, photo))
    }
    return START_NOT_STICKY
  }

  private fun notification(
    name: String,
    handle: String,
    inboxName: String,
    calling: Boolean,
    photo: android.graphics.Bitmap?
  ): android.app.Notification {
    ensureChannel(this)
    val person = Person.Builder()
      .setName(name)
      .setImportant(true)
      .apply { photo?.let { setIcon(IconCompat.createWithBitmap(it)) } }
      .build()
    val details = listOf(inboxName, handle).filter { it.isNotEmpty() }.joinToString(" · ")
    val text = if (calling) listOf("Calling…", details).filter { it.isNotEmpty() }.joinToString(" · ") else details
    return NotificationCompat.Builder(this, CHANNEL_ID)
      .setSmallIcon(R.drawable.cw_notification_logo)
      .setColor(CallNotification.ACCENT)
      .setGroup(CallNotification.GROUP_CALLS)
      .setCategory(NotificationCompat.CATEGORY_CALL)
      .setOngoing(true)
      .setSilent(true)
      .setContentIntent(openCallIntent(this))
      .setStyle(NotificationCompat.CallStyle.forOngoingCall(person, hangUpIntent(this)))
      .setContentTitle(name)
      .setContentText(text.ifEmpty { "Call in progress" })
      .build()
  }

  companion object {
    const val CHANNEL_ID = "voice_calls_ongoing"
    const val NOTIFICATION_ID = 4712
    const val EXTRA_NAME = "name"
    const val EXTRA_HANDLE = "handle"
    const val EXTRA_INBOX_NAME = "inboxName"
    const val EXTRA_AVATAR = "avatar"
    const val EXTRA_STATE = "state"
    const val STATE_CALLING = "calling"
    const val EXTRA_OPEN_CALL = "com.chatwoot.calls.OPEN_CALL"

    fun start(context: Context, name: String, handle: String, inboxName: String, avatar: String, state: String) {
      val intent = Intent(context, OngoingCallService::class.java)
        .putExtra(EXTRA_NAME, name)
        .putExtra(EXTRA_HANDLE, handle)
        .putExtra(EXTRA_INBOX_NAME, inboxName)
        .putExtra(EXTRA_AVATAR, avatar)
        .putExtra(EXTRA_STATE, state)
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        context.startForegroundService(intent)
      } else {
        context.startService(intent)
      }
    }

    fun stop(context: Context) {
      context.stopService(Intent(context, OngoingCallService::class.java))
    }

    // Brings the app up on its call screen
    private fun openCallIntent(context: Context): PendingIntent? {
      val launch = context.packageManager.getLaunchIntentForPackage(context.packageName) ?: return null
      launch.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP)
      launch.putExtra(EXTRA_OPEN_CALL, true)
      return PendingIntent.getActivity(
        context,
        NOTIFICATION_ID,
        launch,
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
      )
    }

    private fun hangUpIntent(context: Context): PendingIntent {
      val intent = Intent(context, CallActionReceiver::class.java).apply {
        action = CallNotification.ACTION_HANG_UP
      }
      return PendingIntent.getBroadcast(
        context,
        CallNotification.ACTION_HANG_UP.hashCode(),
        intent,
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
      )
    }

    private fun ensureChannel(context: Context) {
      val manager = context.getSystemService(android.app.NotificationManager::class.java) ?: return
      if (manager.getNotificationChannel(CHANNEL_ID) != null) return
      manager.createNotificationChannel(
        android.app.NotificationChannel(
          CHANNEL_ID,
          "Calls in progress",
          android.app.NotificationManager.IMPORTANCE_LOW
        )
      )
    }
  }
}
