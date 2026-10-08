package com.chatwoot.calls

import androidx.appcompat.app.AppCompatActivity
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.graphics.Color
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import android.view.View
import android.view.WindowManager
import android.widget.FrameLayout
import com.facebook.react.ReactApplication
import com.facebook.react.interfaces.fabric.ReactSurface
import org.json.JSONObject

// The call screen shown over the lock screen, drawn natively so it appears the moment the
// push arrives. The app runs behind it, invisible, to carry the audio; it is only brought
// forward once the phone is unlocked. Ringing and connecting are native; once the call is
// up, the app's own call screen is rendered into this activity so both screens are one.
class IncomingCallActivity : AppCompatActivity(), com.facebook.react.modules.core.PermissionAwareActivity {

  // The React instance hosted here asks for permissions through its current activity
  private var permissionListener: com.facebook.react.modules.core.PermissionListener? = null

  override fun requestPermissions(
    permissions: Array<String>,
    requestCode: Int,
    listener: com.facebook.react.modules.core.PermissionListener?
  ) {
    permissionListener = listener
    androidx.core.app.ActivityCompat.requestPermissions(this, permissions, requestCode)
  }

  override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<String>, grantResults: IntArray) {
    super.onRequestPermissionsResult(requestCode, permissions, grantResults)
    if (permissionListener?.onRequestPermissionsResult(requestCode, permissions, grantResults) == true) {
      permissionListener = null
    }
  }


  private enum class Phase { RINGING, CONNECTING, ACTIVE }

  private var phase = Phase.RINGING
  private val handler = Handler(Looper.getMainLooper())
  private val ringer = CallRinger(this)
  private val views = IncomingCallViews(this)
  private var root: FrameLayout? = null
  private var callScreen: ReactSurface? = null
  private var muted = false
  private var speakerOn = false
  private var connectedAt = 0L
  private var answeredAt = 0L
  private var callSid = ""
  private var callId: String? = null
  private var callDetails = CallNotification.CallDetails(null, null, null)
  private var unlockReceiver: BroadcastReceiver? = null
  private var visible = false
  private var handedOver = false

  private val tick = object : Runnable {
    override fun run() {
      if (phase != Phase.ACTIVE) return
      val seconds = (SystemClock.elapsedRealtime() - connectedAt) / 1000
      views.stateLabel?.text = String.format("%02d:%02d", seconds / 60, seconds % 60)
      handler.postDelayed(this, 1000)
    }
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    showOverLockScreen()

    val sid = intent.getStringExtra(CallNotification.EXTRA_CALL_SID)
    if (sid.isNullOrBlank()) {
      finish()
      return
    }
    callSid = sid
    callId = intent.getStringExtra(CallNotification.EXTRA_CALL_ID)
    val callerName = intent.getStringExtra(EXTRA_CALLER_NAME).orEmpty()
    val callerPhone = intent.getStringExtra(EXTRA_CALLER_PHONE).orEmpty()
    val callerAvatar = intent.getStringExtra(EXTRA_CALLER_AVATAR).orEmpty()
    callDetails = CallNotification.CallDetails(
      intent.getStringExtra(EXTRA_PROVIDER),
      intent.getStringExtra(EXTRA_CONVERSATION_ID),
      intent.getStringExtra(EXTRA_INBOX_ID),
      callerName,
      callerPhone,
      callerAvatar,
      intent.getStringExtra(EXTRA_ACCOUNT_ID)
    )
    val inboxName = intent.getStringExtra(EXTRA_INBOX_NAME).orEmpty()

    current = this
    root = FrameLayout(this).also { frame ->
      frame.addView(views.buildLayout(callerName, callerPhone, inboxName), FrameLayout.LayoutParams(MATCH, MATCH))
      setContentView(frame)
      androidx.core.view.ViewCompat.setOnApplyWindowInsetsListener(frame) { view, insets ->
        val bars = insets.getInsets(androidx.core.view.WindowInsetsCompat.Type.systemBars())
        view.setPadding(0, bars.top, 0, bars.bottom)
        insets
      }
    }
    if (callerAvatar.isNotEmpty()) loadAvatar(callerAvatar)
    views.showRingingTray(onDecline = { decline() }, onAnswer = { answer() })
    watchForUnlock()
    // Answer pressed on the notification opens this screen already answering
    if (intent.getBooleanExtra(EXTRA_ANSWER, false)) {
      answer()
      return
    }
    ringer.start()
    handler.postDelayed({
      if (phase == Phase.RINGING) {
        TelecomCalls.end(callSid, "missed")
        showNextRingOrFinish()
      }
    }, CallNotification.ringRemainingMs(callSid))
  }

  // The React host mounts views only while it sees a resumed activity, so this screen
  // reports its own lifecycle for as long as it hosts the app's call screen
  override fun onStart() {
    super.onStart()
    visible = true
  }

  override fun onStop() {
    visible = false
    super.onStop()
  }

  override fun onResume() {
    super.onResume()
    if (callScreen != null) runCatching { reactHost?.onHostResume(this) }
  }

  override fun onPause() {
    if (callScreen != null) runCatching { reactHost?.onHostPause(this) }
    super.onPause()
  }

  private val reactHost get() = (application as? ReactApplication)?.reactHost

  override fun onDestroy() {
    ringer.stop()
    views.stopSonar()
    callScreen?.let { runCatching { it.stop() } }
    callScreen = null
    handler.removeCallbacksAndMessages(null)
    unlockReceiver?.let { runCatching { unregisterReceiver(it) } }
    unlockReceiver = null
    if (current === this) current = null
    super.onDestroy()
  }

  // MARK: phases

  private fun answer() {
    ringer.stop()
    views.stopSonar()
    CallNotification.forgetRing(callSid)
    phase = Phase.CONNECTING
    answeredAt = SystemClock.elapsedRealtime()
    views.stateLabel?.text = "Connecting…"
    showInCallTray(enabled = false)
    CallNotification.storePendingAction(this, "answer", callSid, callId, callDetails)
    CallNotification.cancel(this, callSid)
    if (!isKeyguardLocked()) {
      handOverToApp()
      return
    }
    // The app's JavaScript carries the call from behind this screen, with no activity shown
    CallSessionService.start(this, callSid, callId)
    mountCallScreen()
    handler.postDelayed({ if (phase == Phase.CONNECTING) finishAndRemoveTask() }, CONNECT_TIMEOUT_MS)
  }

  // The lock screen is not a way into the app, so Back does nothing here
  @Deprecated("Deprecated in Java")
  override fun onBackPressed() {
    if (phase == Phase.RINGING) super.onBackPressed()
  }

  // The app's call screen, rendered here by the React instance the call already runs in.
  // It stays hidden until it reports a call to draw, so the native controls keep working
  // while the call connects.
  private fun mountCallScreen() {
    if (callScreen != null) return
    val host = (application as? ReactApplication)?.reactHost ?: return
    runCatching {
      val surface = host.createSurface(this, CALL_SCREEN_COMPONENT, null)
      val view = surface.view ?: return
      view.visibility = View.INVISIBLE
      view.setBackgroundColor(Color.TRANSPARENT)
      root?.addView(view, FrameLayout.LayoutParams(MATCH, MATCH))
      callScreen = surface
      host.onHostResume(this)
      surface.start()
    }.onFailure { android.util.Log.w(TAG, "call screen surface failed", it) }
  }

  private fun isKeyguardLocked(): Boolean =
    getSystemService(android.app.KeyguardManager::class.java)?.isKeyguardLocked ?: false

  private fun decline() {
    ringer.stop()
    views.stopSonar()
    TelecomCalls.end(callSid, "rejected")
    CallNotification.storePendingAction(this, "decline", callSid, callId, callDetails)
    CallNotification.cancel(this, callSid)
    // The app applies the stored decline whether it is running or has to be started; the
    // choice is consumed once, so both paths together apply it a single time
    NativeCallBridge.emit("pending")
    CallSessionService.start(this, callSid, callId)
    showNextRingOrFinish()
  }

  // This ring is over; the oldest call still ringing takes the screen, or it closes
  private fun showNextRingOrFinish() {
    CallNotification.forgetRing(callSid)
    val next = CallNotification.nextRingingAfter(callSid)
    if (next == null) {
      finishAndRemoveTask()
      return
    }
    // The screen is rebuilt for the next call in its own task; starting a new screen here
    // would land in this task and be removed with it
    setIntent(intent(this, next))
    recreate()
  }

  private fun connected() {
    if (phase == Phase.ACTIVE) return
    phase = Phase.ACTIVE
    connectedAt = SystemClock.elapsedRealtime()
    showInCallTray(enabled = true)
    handler.post(tick)
  }

  private fun followCall(nextCallSid: String) {
    callSid = nextCallSid
    phase = Phase.CONNECTING
    connected()
  }

  private fun ended() {
    finishAndRemoveTask()
  }

  private fun showInCallTray(enabled: Boolean) {
    views.showInCallTray(
      muted = muted,
      speakerOn = speakerOn,
      enabled = enabled,
      onMute = {
        muted = !muted
        NativeCallBridge.emit("mute", muted)
        showInCallTray(enabled = true)
      },
      onSpeaker = {
        speakerOn = !speakerOn
        NativeCallBridge.emit("speaker", speakerOn)
        showInCallTray(enabled = true)
      },
      onEnd = {
        // The tray changes under the finger that answered; a press right after is not an end
        if (SystemClock.elapsedRealtime() - answeredAt >= TAP_GUARD_MS) endFromTray()
      }
    )
  }

  private fun endFromTray() {
    // The stored choice covers the app not listening yet; the app clears it if it heard
    CallNotification.storePendingAction(this, "decline", callSid, callId, callDetails)
    NativeCallBridge.emit("end", callSid = callSid)
    finishAndRemoveTask()
  }

  private fun loadAvatar(url: String) {
    ContactPhoto.loadAsync(url) { bitmap ->
      runOnUiThread { if (!isDestroyed) views.showAvatar(bitmap) }
    }
  }

  // Once the phone is unlocked the app's own call screen takes over. If the agent went home
  // on the way, this screen closes and the call carries on behind the status bar chip.
  // The unlock broadcast comes from System UI, which Android treats as another app, so
  // the receiver is exported; only the system can send this broadcast.
  private fun watchForUnlock() {
    val receiver = object : BroadcastReceiver() {
      override fun onReceive(context: Context, intent: Intent) {
        if (phase == Phase.RINGING) return
        if (visible) handOverToApp() else finishAndRemoveTask()
      }
    }
    unlockReceiver = receiver
    val filter = IntentFilter(Intent.ACTION_USER_PRESENT)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      registerReceiver(receiver, filter, Context.RECEIVER_EXPORTED)
    } else {
      registerReceiver(receiver, filter)
    }
  }

  private fun handOverToApp() {
    if (handedOver) return
    handedOver = true
    packageManager.getLaunchIntentForPackage(packageName)?.let { launch ->
      launch.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_REORDER_TO_FRONT)
      startActivity(launch)
    }
    finishAndRemoveTask()
  }

  private fun showOverLockScreen() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
      setShowWhenLocked(true)
      setTurnScreenOn(true)
    } else {
      @Suppress("DEPRECATION")
      window.addFlags(
        WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
      )
    }
    window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
    window.statusBarColor = Color.parseColor(IncomingCallViews.BACKGROUND)
    window.navigationBarColor = Color.parseColor(IncomingCallViews.BACKGROUND)
    androidx.core.view.WindowCompat.getInsetsController(window, window.decorView).apply {
      isAppearanceLightStatusBars = true
      isAppearanceLightNavigationBars = true
    }
  }

  companion object {
    @Volatile
    private var current: IncomingCallActivity? = null

    private const val MATCH = FrameLayout.LayoutParams.MATCH_PARENT
    private const val CONNECT_TIMEOUT_MS = 30_000L
    private const val TAP_GUARD_MS = 800L
    private const val CALL_SCREEN_COMPONENT = "ChatwootLockScreenCall"
    private const val TAG = "IncomingCallActivity"
    const val EXTRA_CALLER_NAME = "callerName"
    const val EXTRA_CALLER_PHONE = "callerPhone"
    const val EXTRA_CALLER_AVATAR = "callerAvatar"
    const val EXTRA_INBOX_NAME = "inboxName"
    const val EXTRA_PROVIDER = "provider"
    const val EXTRA_CONVERSATION_ID = "conversationId"
    const val EXTRA_INBOX_ID = "inboxId"
    const val EXTRA_ACCOUNT_ID = "accountId"
    const val EXTRA_ANSWER = "answer"

    // What the app reports about the call it is carrying; a report for another call
    // leaves this screen alone, unless the app switched to that call while this screen
    // held one in progress, which the screen then follows
    fun applyState(state: String, callSid: String?) {
      val activity = current ?: return
      if (callSid != null && activity.callSid != callSid) {
        if (state == "connected" && activity.phase != Phase.RINGING) {
          activity.runOnUiThread { activity.followCall(callSid) }
        }
        return
      }
      activity.runOnUiThread {
        when (state) {
          "connected" -> activity.connected()
          "ended", "failed" -> activity.ended()
        }
      }
    }

    // The app's call screen has a call to draw, or nothing again
    fun setCallScreenVisible(visible: Boolean) {
      val activity = current ?: return
      activity.runOnUiThread {
        activity.callScreen?.view?.visibility = if (visible) View.VISIBLE else View.INVISIBLE
      }
    }

    // Leaves the lock-screen call for the app. The phone shows its unlock screen first,
    // where the fingerprint and PIN work; true once the app has been opened.
    fun openApp(onResult: (Boolean) -> Unit) {
      val activity = current ?: return onResult(false)
      activity.runOnUiThread {
        val keyguard = activity.getSystemService(android.app.KeyguardManager::class.java)
        if (keyguard?.isKeyguardLocked != true || Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
          activity.handOverToApp()
          onResult(true)
          return@runOnUiThread
        }
        keyguard.requestDismissKeyguard(activity, object : android.app.KeyguardManager.KeyguardDismissCallback() {
          override fun onDismissSucceeded() {
            activity.handOverToApp()
            onResult(true)
          }

          override fun onDismissCancelled() = onResult(false)

          override fun onDismissError() = onResult(false)
        })
      }
    }

    // An answer or decline from a system surface lands on the screen when it is showing
    fun applySystemAction(callSid: String, action: String): Boolean {
      val activity = current ?: return false
      if (activity.callSid != callSid || activity.phase != Phase.RINGING) return false
      activity.runOnUiThread { if (action == "answer") activity.answer() else activity.decline() }
      return true
    }

    // The server says this ring is over; a call already being answered is left to the app
    fun cancelRinging(callSid: String) {
      val activity = current ?: return
      activity.runOnUiThread {
        if (activity.callSid == callSid && activity.phase == Phase.RINGING) activity.showNextRingOrFinish()
      }
    }

    // Whether the screen is up and still ringing
    fun isRinging(): Boolean = current?.phase == Phase.RINGING

    // Whether the screen is up at all, ringing or carrying a call
    fun isShowing(): Boolean = current != null

    fun intent(context: Context, data: Map<String, String>): Intent {
      val caller = runCatching { JSONObject(data["caller"] ?: "{}") }.getOrNull()
      return Intent(context, IncomingCallActivity::class.java).apply {
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
        putExtra(CallNotification.EXTRA_CALL_SID, data["call_id"])
        putExtra(CallNotification.EXTRA_CALL_ID, data["id"])
        putExtra(EXTRA_CALLER_NAME, caller?.optString("name").orEmpty())
        putExtra(EXTRA_CALLER_PHONE, caller?.optString("phone").orEmpty())
        putExtra(EXTRA_CALLER_AVATAR, caller?.optString("avatar").orEmpty())
        putExtra(EXTRA_INBOX_NAME, data["inbox_name"].orEmpty())
        putExtra(EXTRA_PROVIDER, data["provider"])
        putExtra(EXTRA_CONVERSATION_ID, data["conversation_id"])
        putExtra(EXTRA_INBOX_ID, data["inbox_id"])
        putExtra(EXTRA_ACCOUNT_ID, data["account_id"])
      }
    }
  }
}
