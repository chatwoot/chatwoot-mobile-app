package com.chatwoot.calls

import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import androidx.core.app.NotificationManagerCompat
import androidx.core.app.Person
import androidx.core.graphics.drawable.IconCompat
import com.google.firebase.messaging.RemoteMessage
import io.invertase.firebase.messaging.ReactNativeFirebaseMessagingService
import org.json.JSONObject

// Rings for an incoming call straight from the push, without waiting for JavaScript to
// start. With the app in front the push goes to JavaScript instead, which shows the call
// in the app itself. Every other message is left to the React Native Firebase service
// this extends.
class CallMessagingService : ReactNativeFirebaseMessagingService() {

  override fun onMessageReceived(remoteMessage: RemoteMessage) {
    val data = remoteMessage.data
    val callSid = data["call_id"]
    if (callSid.isNullOrBlank()) {
      super.onMessageReceived(remoteMessage)
      return
    }
    when (data["type"]) {
      "voice_call.incoming" -> {
        if (AppVisibility.foreground) {
          super.onMessageReceived(remoteMessage)
          return
        }
        CallNotification.show(applicationContext, data)
        CallSessionService.warm(applicationContext)
      }
      // The ring is over: answered elsewhere, declined, dropped or timed out
      "voice_call.cancel" -> {
        CallNotification.forgetRing(callSid)
        CallNotification.cancel(applicationContext)
        IncomingCallActivity.cancelRinging(callSid)
        TelecomCalls.endRinging(callSid, data["reason"].orEmpty())
        if (AppVisibility.foreground) super.onMessageReceived(remoteMessage)
      }
      else -> super.onMessageReceived(remoteMessage)
    }
  }
}



object CallNotification {
  const val CHANNEL_ID = "voice_calls_ring"
  const val NOTIFICATION_ID = 4711
  const val ACTION_ANSWER = "com.chatwoot.calls.ANSWER"
  const val ACTION_DECLINE = "com.chatwoot.calls.DECLINE"
  const val ACTION_HANG_UP = "com.chatwoot.calls.HANG_UP"
  const val EXTRA_CALL_SID = "callSid"
  const val EXTRA_CALL_ID = "callId"
  const val PREFS = "chatwoot_calls"
  const val PENDING_ACTION_KEY = "pendingCallAction"
  // Keeps the call out of the app's message notification group, which would otherwise
  // hide the app name from the call's own header
  const val GROUP_CALLS = "chatwoot_calls"
  const val ACCENT = 0xFF1F93FF.toInt()
  private const val RING_TIMEOUT_MS = 45_000L

  fun show(context: Context, data: Map<String, String>) {
    val callSid = data["call_id"] ?: return
    val caller = runCatching { JSONObject(data["caller"] ?: "{}") }.getOrNull()
    val name = caller?.optString("name").takeUnless { it.isNullOrBlank() } ?: "Unknown caller"
    val inboxName = data["inbox_name"].orEmpty()

    CallNotificationChannel.ensure(context)
    remember(callSid, data)
    ringing[callSid] = data
    TelecomCalls.add(context, callSid, name, caller?.optString("phone").orEmpty(), outgoing = false)
    // The ring screen keeps the call it is showing; a further ring waits its turn there
    val fullScreen = !IncomingCallActivity.isRinging()
    val manager = NotificationManagerCompat.from(context)
    manager.notify(NOTIFICATION_ID, build(context, data, callSid, name, inboxName, null, fullScreen))
    // The photo follows once it is in, as long as the call is still ringing
    ContactPhoto.fetchAsync(caller?.optString("avatar")) { photo ->
      val stillRinging = manager.activeNotifications.any { it.id == NOTIFICATION_ID }
      if (stillRinging) manager.notify(NOTIFICATION_ID, build(context, data, callSid, name, inboxName, photo, fullScreen))
    }
  }

  // The calls still ringing on this phone, oldest first
  private val ringing = java.util.Collections.synchronizedMap(LinkedHashMap<String, Map<String, String>>())

  fun forgetRing(callSid: String) {
    ringing.remove(callSid)
  }

  fun nextRingingAfter(callSid: String): Map<String, String>? = synchronized(ringing) {
    ringing.entries.firstOrNull { it.key != callSid }?.value
  }

  private fun build(
    context: Context,
    data: Map<String, String>,
    callSid: String,
    name: String,
    inboxName: String,
    photo: android.graphics.Bitmap?,
    fullScreen: Boolean = true
  ): android.app.Notification {
    val person = Person.Builder()
      .setName(name)
      .setImportant(true)
      .apply { photo?.let { setIcon(IconCompat.createWithBitmap(it)) } }
      .build()
    val builder = androidx.core.app.NotificationCompat.Builder(context, CHANNEL_ID)
      .setSmallIcon(R.drawable.cw_notification_logo)
      .setColor(ACCENT)
      .setGroup(GROUP_CALLS)
      .setCategory(androidx.core.app.NotificationCompat.CATEGORY_CALL)
      .setPriority(androidx.core.app.NotificationCompat.PRIORITY_MAX)
      .setVisibility(androidx.core.app.NotificationCompat.VISIBILITY_PUBLIC)
      .setOngoing(true)
      .setAutoCancel(false)
      .setTimeoutAfter(RING_TIMEOUT_MS)
      .apply { if (fullScreen) setFullScreenIntent(openAppIntent(context, callSid, data), true) }
      .setStyle(
        androidx.core.app.NotificationCompat.CallStyle.forIncomingCall(
          person,
          actionIntent(context, ACTION_DECLINE, callSid, data),
          actionIntent(context, ACTION_ANSWER, callSid, data)
        )
      )
      .setContentTitle(name)
      .setContentText(if (inboxName.isEmpty()) "Incoming call" else "Incoming call · $inboxName")
    return builder.build()
  }

  fun cancel(context: Context) {
    NotificationManagerCompat.from(context).cancel(NOTIFICATION_ID)
  }

  // What the push carried, kept for an answer or decline that comes from a system surface
  private val remembered = java.util.concurrent.ConcurrentHashMap<String, Map<String, String>>()

  fun remember(callSid: String, data: Map<String, String>) {
    remembered[callSid] = data
  }

  fun detailsFor(callSid: String): CallDetails? {
    val data = remembered[callSid] ?: return null
    val caller = runCatching { JSONObject(data["caller"] ?: "{}") }.getOrNull()
    return CallDetails(
      data["provider"], data["conversation_id"], data["inbox_id"],
      caller?.optString("name"), caller?.optString("phone"), caller?.optString("avatar")
    )
  }

  fun callIdFor(callSid: String): String? = remembered[callSid]?.get("id")

  // A headset button, a watch or the system took the call or ended the ring
  fun applySystemAction(context: Context, action: String, callSid: String) {
    if (IncomingCallActivity.applySystemAction(callSid, action)) return
    val details = detailsFor(callSid) ?: return
    storePendingAction(context, action, callSid, callIdFor(callSid), details)
    cancel(context)
    NativeCallBridge.emit("pending")
    CallSessionService.start(context, callSid, callIdFor(callSid))
    if (action == "answer") {
      context.packageManager.getLaunchIntentForPackage(context.packageName)?.let { launch ->
        launch.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
        context.startActivity(launch)
      }
    }
  }

  // What the app needs to answer a call it has not yet seen over the socket
  data class CallDetails(
    val provider: String?,
    val conversationId: String?,
    val inboxId: String?,
    val callerName: String? = null,
    val callerPhone: String? = null,
    val callerAvatar: String? = null
  )

  // The agent's choice, kept until the app is running and can act on it
  fun storePendingAction(
    context: Context,
    action: String,
    callSid: String,
    callId: String?,
    details: CallDetails
  ) {
    val pending = JSONObject()
      .put("action", action)
      .put("callSid", callSid)
      .apply {
        callId?.toIntOrNull()?.let { put("callId", it) }
        details.provider?.let { put("provider", it) }
        details.conversationId?.toIntOrNull()?.let { put("conversationId", it) }
        details.inboxId?.toIntOrNull()?.let { put("inboxId", it) }
        val caller = JSONObject()
        details.callerName?.takeIf { it.isNotBlank() }?.let { caller.put("name", it) }
        details.callerPhone?.takeIf { it.isNotBlank() }?.let { caller.put("phone", it) }
        details.callerAvatar?.takeIf { it.isNotBlank() }?.let { caller.put("avatar", it) }
        if (caller.length() > 0) put("caller", caller)
      }
    context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
      .edit()
      .putString(PENDING_ACTION_KEY, pending.toString())
      .apply()
  }

  private fun openAppIntent(context: Context, callSid: String, data: Map<String, String>): PendingIntent {
    return PendingIntent.getActivity(
      context,
      callSid.hashCode(),
      IncomingCallActivity.intent(context, data),
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )
  }

  private fun actionIntent(
    context: Context,
    action: String,
    callSid: String,
    data: Map<String, String>
  ): PendingIntent {
    val intent = Intent(context, CallActionReceiver::class.java).apply {
      this.action = action
      putExtra(EXTRA_CALL_SID, callSid)
      putExtra(EXTRA_CALL_ID, data["id"])
      putExtra(IncomingCallActivity.EXTRA_PROVIDER, data["provider"])
      putExtra(IncomingCallActivity.EXTRA_CONVERSATION_ID, data["conversation_id"])
      putExtra(IncomingCallActivity.EXTRA_INBOX_ID, data["inbox_id"])
      val caller = runCatching { JSONObject(data["caller"] ?: "{}") }.getOrNull()
      putExtra(IncomingCallActivity.EXTRA_CALLER_NAME, caller?.optString("name"))
      putExtra(IncomingCallActivity.EXTRA_CALLER_PHONE, caller?.optString("phone"))
      putExtra(IncomingCallActivity.EXTRA_CALLER_AVATAR, caller?.optString("avatar"))
    }
    return PendingIntent.getBroadcast(
      context,
      action.hashCode(),
      intent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )
  }
}

object CallNotificationChannel {
  fun ensure(context: Context) {
    val manager = context.getSystemService(android.app.NotificationManager::class.java) ?: return
    if (manager.getNotificationChannel(CallNotification.CHANNEL_ID) != null) return
    val channel = android.app.NotificationChannel(
      CallNotification.CHANNEL_ID,
      "Calls",
      android.app.NotificationManager.IMPORTANCE_HIGH
    ).apply {
      lockscreenVisibility = android.app.Notification.VISIBILITY_PUBLIC
      enableVibration(true)
      setSound(
        android.media.RingtoneManager.getDefaultUri(android.media.RingtoneManager.TYPE_RINGTONE),
        android.media.AudioAttributes.Builder()
          .setUsage(android.media.AudioAttributes.USAGE_NOTIFICATION_RINGTONE)
          .setContentType(android.media.AudioAttributes.CONTENT_TYPE_SONIFICATION)
          .build()
      )
    }
    manager.createNotificationChannel(channel)
  }
}
