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
          // The app rings for it; the phone takes over if the app leaves the front
          CallNotification.defer(data)
          super.onMessageReceived(remoteMessage)
          return
        }
        CallNotification.show(applicationContext, data)
        CallSessionService.warm(applicationContext)
      }
      // The ring is over: answered elsewhere, declined, dropped or timed out
      "voice_call.cancel" -> {
        CallNotification.forgetRing(callSid)
        CallNotification.cancel(applicationContext, callSid)
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
  // The ring screen has its own ringtone, so a notification posted beside it stays quiet
  const val SILENT_CHANNEL_ID = "voice_calls_ring_silent"
  private const val RING_NOTIFICATION_BASE = 20_000
  const val ACTION_ANSWER = "com.chatwoot.calls.ANSWER"
  const val ACTION_DECLINE = "com.chatwoot.calls.DECLINE"
  const val ACTION_HANG_UP = "com.chatwoot.calls.HANG_UP"
  const val ACTION_DISMISS = "com.chatwoot.calls.DISMISS"
  const val EXTRA_CALL_SID = "callSid"
  const val EXTRA_CALL_ID = "callId"
  const val PREFS = "chatwoot_calls"
  const val PENDING_ACTION_KEY = "pendingCallAction"
  // Keeps the call out of the app's message notification group, which would otherwise
  // hide the app name from the call's own header
  const val GROUP_CALLS = "chatwoot_calls"
  const val ACCENT = 0xFF1F93FF.toInt()
  private const val RING_TIMEOUT_MS = 60_000L

  fun show(context: Context, data: Map<String, String>) {
    val callSid = data["call_id"] ?: return
    val caller = runCatching { JSONObject(data["caller"] ?: "{}") }.getOrNull()
    val name = caller?.optString("name").takeUnless { it.isNullOrBlank() } ?: "Unknown caller"
    val inboxName = data["inbox_name"].orEmpty()

    CallNotificationChannel.ensure(context)
    remember(callSid, data)
    ringing[callSid] = data
    TelecomCalls.add(context, callSid, name, caller?.optString("phone").orEmpty(), outgoing = false)
    // The ring screen keeps the call it is showing, ringing or in progress; a further ring
    // waits its turn there. Exactly one thing rings: the ring screen where it is up or about
    // to open over the lock screen, the app itself where the agent is looking at it, and
    // otherwise this notification.
    val screenShowing = IncomingCallActivity.isShowing()
    val fullScreen = !screenShowing
    val overLockScreen = screenShowing || ringScreenWillOpen(context)
    val ringsElsewhere = IncomingCallActivity.isRinging() || AppVisibility.foreground ||
      (fullScreen && overLockScreen)
    val manager = NotificationManagerCompat.from(context)
    val id = notificationId(callSid)
    manager.notify(id, build(context, data, callSid, name, inboxName, null, fullScreen, ringsElsewhere, overLockScreen))
    // The photo follows once it is in, as long as this call is still ringing, on the same
    // channel so the ring it started carries on
    ContactPhoto.fetchAsync(caller?.optString("avatar")) { photo ->
      val stillRinging = manager.activeNotifications.any { it.id == id }
      if (stillRinging) {
        runCatching {
          manager.notify(id, build(context, data, callSid, name, inboxName, photo, fullScreen, ringsElsewhere, overLockScreen))
        }
      }
    }
  }

  // The full-screen intent opens the ring screen, rather than a heads-up, when the phone is
  // locked or its screen is off and the app may use full-screen intents
  private fun ringScreenWillOpen(context: Context): Boolean {
    val keyguard = context.getSystemService(android.app.KeyguardManager::class.java)
    val power = context.getSystemService(android.os.PowerManager::class.java)
    val covered = keyguard?.isKeyguardLocked == true || power?.isInteractive == false
    if (!covered) return false
    if (android.os.Build.VERSION.SDK_INT < 34) return true
    return context.getSystemService(android.app.NotificationManager::class.java)
      ?.canUseFullScreenIntent() == true
  }

  // Rings the app took while in front, with when each arrived
  private val deferred = java.util.concurrent.ConcurrentHashMap<String, Pair<Map<String, String>, Long>>()

  fun defer(data: Map<String, String>) {
    val callSid = data["call_id"] ?: return
    deferred[callSid] = data to android.os.SystemClock.elapsedRealtime()
  }

  // The app left the front: rings it took that are still within their ring window are
  // posted here. True when any was.
  fun showDeferred(context: Context): Boolean {
    val now = android.os.SystemClock.elapsedRealtime()
    val live = deferred.values.filter { now - it.second < RING_TIMEOUT_MS }.map { it.first }
    deferred.clear()
    live.forEach { runCatching { show(context, it) } }
    return live.isNotEmpty()
  }

  // The calls still ringing on this phone, oldest first
  private val ringing = java.util.Collections.synchronizedMap(LinkedHashMap<String, Map<String, String>>())

  fun forgetRing(callSid: String) {
    ringing.remove(callSid)
    deferred.remove(callSid)
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
    fullScreen: Boolean = true,
    silent: Boolean = false,
    overLockScreen: Boolean = false
  ): android.app.Notification {
    val person = Person.Builder()
      .setName(name)
      .setImportant(true)
      .apply { photo?.let { setIcon(IconCompat.createWithBitmap(it)) } }
      .build()
    val builder = androidx.core.app.NotificationCompat.Builder(
      context,
      if (silent) SILENT_CHANNEL_ID else CHANNEL_ID
    )
      .setSmallIcon(R.drawable.cw_notification_logo)
      .setColor(ACCENT)
      .setGroup(GROUP_CALLS)
      .setCategory(androidx.core.app.NotificationCompat.CATEGORY_CALL)
      .setPriority(androidx.core.app.NotificationCompat.PRIORITY_MAX)
      .setVisibility(androidx.core.app.NotificationCompat.VISIBILITY_PUBLIC)
      .setOngoing(true)
      .setAutoCancel(false)
      .setOnlyAlertOnce(true)
      .setTimeoutAfter(RING_TIMEOUT_MS)
      // Swiped away: the ring stops on this phone only
      .setDeleteIntent(actionIntent(context, ACTION_DISMISS, callSid, data))
    val decline = actionIntent(context, ACTION_DECLINE, callSid, data)
    // Over the lock screen, Answer goes to the ring screen through a broadcast: a button that
    // opens an activity makes the lock screen ask for the PIN first
    val answer = if (overLockScreen) {
      actionIntent(context, ACTION_ANSWER, callSid, data)
    } else {
      answerIntent(context, callSid, data)
    }
    if (fullScreen) {
      builder
        .setFullScreenIntent(openAppIntent(context, callSid, data), true)
        .setStyle(androidx.core.app.NotificationCompat.CallStyle.forIncomingCall(person, decline, answer))
    } else {
      // Android only accepts the call style with a full-screen intent or a foreground
      // service, so a ring queued behind the ring screen is a plain notification with
      // the same two actions
      builder
        .setLargeIcon(photo)
        .addAction(0, "Decline", decline)
        .addAction(0, "Answer", answer)
    }
    builder
      .setContentTitle(name)
      .setContentText(if (inboxName.isEmpty()) "Incoming call" else "Incoming call · $inboxName")
    return builder.build()
  }

  // Each ringing call has its own notification, so ending one ring leaves the others
  fun notificationId(callSid: String) = RING_NOTIFICATION_BASE + (callSid.hashCode() and 0xFFFF)

  fun cancel(context: Context, callSid: String) {
    NotificationManagerCompat.from(context).cancel(notificationId(callSid))
  }

  // Every ring notification this app has up
  fun cancel(context: Context) {
    val manager = NotificationManagerCompat.from(context)
    manager.activeNotifications
      .filter { it.notification.group == GROUP_CALLS && it.id != OngoingCallService.NOTIFICATION_ID }
      .forEach { manager.cancel(it.id) }
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
      caller?.optString("name"), caller?.optString("phone"), caller?.optString("avatar"),
      data["account_id"]
    )
  }

  fun callIdFor(callSid: String): String? = remembered[callSid]?.get("id")

  // A headset button, a watch or the system took the call or ended the ring
  fun applySystemAction(context: Context, action: String, callSid: String) {
    if (IncomingCallActivity.applySystemAction(callSid, action)) return
    val details = detailsFor(callSid) ?: return
    storePendingAction(context, action, callSid, callIdFor(callSid), details)
    // Only the call acted on; other waiting calls keep their notifications
    forgetRing(callSid)
    cancel(context, callSid)
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
    val callerAvatar: String? = null,
    val accountId: String? = null
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
        details.accountId?.toIntOrNull()?.let { put("accountId", it) }
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

  // Answer opens an activity directly; Android does not let a notification action start
  // one from a broadcast receiver
  private fun answerIntent(context: Context, callSid: String, data: Map<String, String>): PendingIntent {
    val intent = IncomingCallActivity.intent(context, data)
      .setClass(context, CallAnswerActivity::class.java)
      .setFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    return PendingIntent.getActivity(
      context,
      (ACTION_ANSWER + callSid).hashCode(),
      intent,
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
      putExtra(IncomingCallActivity.EXTRA_ACCOUNT_ID, data["account_id"])
      putExtra(IncomingCallActivity.EXTRA_INBOX_NAME, data["inbox_name"])
      val caller = runCatching { JSONObject(data["caller"] ?: "{}") }.getOrNull()
      putExtra(IncomingCallActivity.EXTRA_CALLER_NAME, caller?.optString("name"))
      putExtra(IncomingCallActivity.EXTRA_CALLER_PHONE, caller?.optString("phone"))
      putExtra(IncomingCallActivity.EXTRA_CALLER_AVATAR, caller?.optString("avatar"))
    }
    return PendingIntent.getBroadcast(
      context,
      (action + callSid).hashCode(),
      intent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )
  }
}

object CallNotificationChannel {
  // Two channels for the same ring: the audible one for a call the phone shows only as a
  // notification, and a silent one for a call whose ring screen is already ringing
  fun ensure(context: Context) {
    // Channels exist from Android 8; earlier versions post without one
    if (android.os.Build.VERSION.SDK_INT < android.os.Build.VERSION_CODES.O) return
    val manager = context.getSystemService(android.app.NotificationManager::class.java) ?: return
    if (manager.getNotificationChannel(CallNotification.CHANNEL_ID) == null) {
      manager.createNotificationChannel(ringingChannel())
    }
    if (manager.getNotificationChannel(CallNotification.SILENT_CHANNEL_ID) == null) {
      manager.createNotificationChannel(silentChannel())
    }
  }

  private fun ringingChannel() = android.app.NotificationChannel(
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

  private fun silentChannel() = android.app.NotificationChannel(
    CallNotification.SILENT_CHANNEL_ID,
    "Calls in progress",
    android.app.NotificationManager.IMPORTANCE_HIGH
  ).apply {
    lockscreenVisibility = android.app.Notification.VISIBILITY_PUBLIC
    enableVibration(false)
    setSound(null, null)
  }
}
