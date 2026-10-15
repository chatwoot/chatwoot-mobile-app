package com.chatwoot.calls

import android.content.Context
import android.net.Uri
import android.os.Build
import android.telecom.DisconnectCause
import android.util.Log
import android.media.AudioManager
import androidx.core.telecom.CallAttributesCompat
import androidx.core.telecom.CallControlResult
import androidx.core.telecom.CallControlScope
import androidx.core.telecom.CallEndpointCompat
import androidx.core.telecom.CallsManager
import java.util.concurrent.ConcurrentHashMap
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch

// Registers each call with Android's Telecom framework, the counterpart of CallKit. The
// system then routes audio to Bluetooth, car and watch, treats the call as a phone call
// for do-not-disturb and a cellular call arriving mid-call, and shows its own in-call
// chip. The ring screen and notification stay ours; Telecom is told when the call is
// answered, connected and ended, and asked for audio route changes.
object TelecomCalls {
  private const val TAG = "TelecomCalls"
  private const val AUTO_RESUME_POLL_MS = 1000L
  // A ring still open with Telecom past the ring window, and this margin, is ended,
  // whatever left it open; a ringing call there blocks new ones and takes the audio route
  // requests. The window counts from when the call began ringing, a ring posted again
  // included.
  private const val RING_LIMIT_MARGIN_MS = 5_000L

  private class Tracked(val callSid: String) {
    val addedAt = android.os.SystemClock.elapsedRealtime()
    // Endpoint flows can remain open after the platform disconnects the call.
    val work = CoroutineScope(SupervisorJob() + Dispatchers.Main)
    @Volatile var scope: CallControlScope? = null
    @Volatile var ended = false
    @Volatile var active = false
    @Volatile var held = false
    @Volatile var userHeld = false
    @Volatile var endPending: DisconnectCause? = null
    @Volatile var endingLocally = false
    @Volatile var endpoints: List<CallEndpointCompat> = emptyList()
    @Volatile var current: CallEndpointCompat? = null
    var requestedRoute: String? = null
    var routeJob: Job? = null
  }

  private val tracked = ConcurrentHashMap<String, Tracked>()
  private val mainScope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
  private var manager: CallsManager? = null
  @Volatile private var appContext: Context? = null

  // The last call could not be registered with Telecom; the app then manages the call's
  // audio itself until a registration succeeds
  @Volatile var registrationFailed = false
  // Told when a registration fails, so a call already under way switches to the app's own
  // audio handling
  @Volatile var onRegistrationFailed: ((callSid: String) -> Unit)? = null

  // The agent acted on a system surface such as a headset button or a watch
  @Volatile var onSystemAnswer: ((callSid: String) -> Unit)? = null
  @Volatile var onSystemDisconnect: ((callSid: String) -> Unit)? = null
  // The system put the call on hold, or took it back: a cellular call was answered or ended
  @Volatile var onSystemHold: ((callSid: String, held: Boolean) -> Unit)? = null

  // Before the module has set its handlers, while a push is still starting the app, the
  // choice is kept as a pending action for the app to apply once it is running
  private fun systemAnswer(context: Context, callSid: String) {
    val handler = onSystemAnswer
    if (handler != null) handler(callSid) else CallNotification.applySystemAction(context, "answer", callSid)
  }

  private fun systemDisconnect(context: Context, callSid: String) {
    val handler = onSystemDisconnect
    when {
      handler != null -> handler(callSid)
      CallNotification.isRinging(callSid) -> CallNotification.applySystemAction(context, "decline", callSid)
      else -> CallNotification.storeEnd(context, callSid)
    }
  }
  // The audio route changed, or the set of routes did; names are the devices' own
  @Volatile var onAudioRoute: ((callSid: String, current: String, available: List<String>, names: List<String>) -> Unit)? = null

  // Android 14+ uses Telecom; older devices use AppCallAudio.
  // The debug property lets a tester run without Telecom:
  // adb shell setprop debug.chatwoot.telecom 0
  val supported: Boolean
    get() = Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE && debugProperty("debug.chatwoot.telecom") != "0"

  val available: Boolean
    get() = supported && (!registrationFailed || routeTarget() != null)

  private fun debugProperty(name: String): String? = runCatching {
    val clazz = Class.forName("android.os.SystemProperties")
    clazz.getMethod("get", String::class.java).invoke(null, name) as? String
  }.getOrNull()

  fun add(context: Context, callSid: String, displayName: String, handle: String, outgoing: Boolean) {
    if (!supported || tracked.containsKey(callSid)) return
    appContext = context.applicationContext
    if (tracked.values.none { !it.ended }) clearRouteOverride()
    val entry = Tracked(callSid)
    tracked[callSid] = entry
    Log.i(TAG, "tracking call=$callSid sdk=${Build.VERSION.SDK_INT} outgoing=$outgoing")
    if (!outgoing) {
      mainScope.launch {
        kotlinx.coroutines.delay(CallNotification.ringRemainingMs(callSid) + RING_LIMIT_MARGIN_MS)
        if (tracked[callSid] === entry && !entry.active) {
          Log.w(TAG, "call $callSid still ringing with Telecom after the ring window; ending it")
          end(callSid, "missed")
        }
      }
    }
    val attributes = CallAttributesCompat(
      displayName.ifBlank { "Call" },
      Uri.fromParts("tel", handle.ifBlank { callSid }, null),
      if (outgoing) CallAttributesCompat.DIRECTION_OUTGOING else CallAttributesCompat.DIRECTION_INCOMING,
      CallAttributesCompat.CALL_TYPE_AUDIO_CALL,
      CallAttributesCompat.SUPPORTS_SET_INACTIVE
    )
    val appContext = context.applicationContext
    mainScope.launch {
      try {
        manager(context).addCall(
          attributes,
          onAnswer = { systemAnswer(appContext, callSid) },
          onDisconnect = {
            finishRouting(entry)
            if (!entry.endingLocally) systemDisconnect(appContext, callSid)
          },
          onSetActive = { markHeld(entry, false) },
          onSetInactive = {
            markHeld(entry, true)
            if (!entry.userHeld) autoResume(entry)
          }
        ) {
          entry.scope = this
          registrationFailed = false
          // Marked active before the scope existed: catch up now
          if (entry.active && !entry.ended) launch { setActive() }
          entry.work.launch {
            availableEndpoints.collect { list ->
              entry.endpoints = list
              emitRoute(entry)
              requestPendingRoute(entry)
            }
          }
          entry.work.launch {
            currentCallEndpoint.collect { endpoint ->
              entry.current = endpoint
              emitRoute(entry)
            }
          }
          requestPendingRoute(entry)
          entry.endPending?.let { cause -> launch { disconnect(cause) } }
        }
      } catch (e: CancellationException) {
        throw e
      } catch (e: Exception) {
        Log.w(TAG, "call $callSid could not be tracked: ${e.message}")
        finishRouting(entry)
        tracked.remove(callSid, entry)
        registrationFailed = true
        onRegistrationFailed?.invoke(callSid)
      } finally {
        finishRouting(entry)
        tracked.remove(callSid, entry)
      }
    }
  }

  fun setActive(callSid: String) {
    val entry = tracked[callSid] ?: return
    if (entry.ended) return
    entry.active = true
    val scope = entry.scope ?: return
    scope.launch { scope.setActive() }
  }

  // Parks the call at the agent's request; returns false when Telecom is not tracking it
  fun hold(callSid: String): Boolean {
    val entry = tracked[callSid] ?: return false
    val scope = entry.scope ?: return false
    entry.userHeld = true
    scope.launch {
      if (scope.setInactive() is CallControlResult.Success) markHeld(entry, true)
      else entry.userHeld = false
    }
    return true
  }

  // The app is answering this ring: a cancel push that crosses the answer must leave it alone
  fun markAnswering(callSid: String) {
    tracked[callSid]?.active = true
  }

  // An answer that did not go through leaves the call ringing in Telecom; this ends it
  fun abandonAnswer(callSid: String) {
    tracked[callSid]?.active = false
    endRinging(callSid, "failed")
  }

  // Asks Telecom for the call back; succeeds once no other call holds the audio.
  // Returns false when Telecom is not tracking the call
  fun resume(callSid: String): Boolean {
    val entry = tracked[callSid] ?: return false
    val scope = entry.scope ?: return false
    entry.userHeld = false
    scope.launch {
      if (scope.setActive() is CallControlResult.Success) markHeld(entry, false)
    }
    return true
  }

  private fun markHeld(entry: Tracked, held: Boolean) {
    if (entry.held == held) return
    entry.held = held
    onSystemHold?.invoke(entry.callSid, held)
  }

  // Android does not hand a held self-managed call back by itself when the call that
  // displaced it ends, so while held the call is asked for again once no other call
  // is in the audio mode
  private fun autoResume(entry: Tracked) {
    val scope = entry.scope ?: return
    entry.work.launch {
      while (entry.held && !entry.userHeld) {
        kotlinx.coroutines.delay(AUTO_RESUME_POLL_MS)
        if (!entry.held || entry.userHeld) break
        val audio = appContext?.getSystemService(Context.AUDIO_SERVICE) as? AudioManager
        if (audio?.mode == AudioManager.MODE_IN_CALL) continue
        if (scope.setActive() is CallControlResult.Success) markHeld(entry, false)
      }
    }
  }

  // The server says the ring is over. That also reaches the device that answered, so a
  // call already live here is left alone.
  fun endRinging(callSid: String, reason: String) {
    val entry = tracked[callSid] ?: return
    if (entry.active) return
    end(callSid, reason)
  }

  fun end(callSid: String, reason: String) {
    val entry = tracked[callSid] ?: return
    entry.endingLocally = true
    finishRouting(entry)
    // Telecom accepts only these four causes from an app; a call that failed here ended on
    // this side, so it counts as local
    val cause = DisconnectCause(
      when (reason) {
        "rejected", "declined" -> DisconnectCause.REJECTED
        "missed", "no_answer", "unanswered" -> DisconnectCause.MISSED
        "local", "failed", "error" -> DisconnectCause.LOCAL
        else -> DisconnectCause.REMOTE
      }
    )
    val scope = entry.scope
    if (scope == null) {
      entry.endPending = cause
      return
    }
    scope.launch { scope.disconnect(cause) }
  }

  private fun finishRouting(entry: Tracked) {
    if (entry.ended) return
    entry.ended = true
    entry.active = false
    entry.work.cancel()
    Log.i(TAG, "routing ended call=${entry.callSid}")
    if (tracked.values.none { !it.ended }) clearRouteOverride()
  }

  private fun clearRouteOverride() {
    val audio = appContext?.getSystemService(Context.AUDIO_SERVICE) as? AudioManager ?: return
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) audio.clearCommunicationDevice()
    else {
      @Suppress("DEPRECATION")
      audio.stopBluetoothSco()
      @Suppress("DEPRECATION")
      audio.isSpeakerphoneOn = false
    }
  }

  // A registering call can keep a route choice until its endpoints arrive.
  private fun routeTarget(): Tracked? {
    val live = tracked.values.filter { !it.ended }
    return live.filter { it.active }.maxByOrNull { it.addedAt } ?: live.maxByOrNull { it.addedAt }
  }

  // Speaker on, or the best non-speaker route available: Bluetooth, then a wired headset,
  // then the earpiece. False means the app must manage audio without Telecom.
  fun setSpeaker(enabled: Boolean): Boolean = setRoute(if (enabled) "speaker" else "default")

  // Telecom owns the request even while the call or endpoint is not ready.
  fun setRoute(route: String): Boolean {
    if (!available) return false
    val entry = routeTarget()
    Log.i(TAG, "route requested=$route call=${entry?.callSid} ready=${entry?.scope != null}")
    if (entry != null) entry.work.launch {
      entry.requestedRoute = route
      entry.routeJob?.cancel()
      requestPendingRoute(entry)
    }
    return true
  }

  fun currentRoute(): Triple<String, List<String>, List<String>> {
    val entry = routeTarget() ?: return Triple("unknown", emptyList(), emptyList())
    return Triple(routeName(entry.current), entry.endpoints.map { routeName(it) }, entry.endpoints.map { it.name.toString() })
  }

  private fun requestPendingRoute(entry: Tracked) {
    if (entry.ended) return
    val scope = entry.scope ?: return
    val route = entry.requestedRoute ?: return
    if (entry.endpoints.isEmpty()) return
    val endpoint = if (route == "default") {
      listOf("bluetooth", "wired", "earpiece").firstNotNullOfOrNull { name ->
        entry.endpoints.firstOrNull { routeName(it) == name }
      }
    } else entry.endpoints.firstOrNull { routeName(it) == route }
    entry.requestedRoute = null
    if (endpoint == null) {
      Log.w(TAG, "route unavailable=$route call=${entry.callSid}")
      emitRoute(entry)
      return
    }
    entry.routeJob = entry.work.launch {
      try {
        val result = scope.requestEndpointChange(endpoint)
        Log.i(TAG, "route result=$result requested=$route current=${routeName(entry.current)} call=${entry.callSid}")
      } catch (e: CancellationException) {
        throw e
      } catch (e: Exception) {
        Log.w(TAG, "route failed=$route call=${entry.callSid}: ${e.message}")
      }
      emitRoute(entry)
    }
  }

  private fun manager(context: Context): CallsManager =
    manager ?: CallsManager(context.applicationContext).also {
      it.registerAppWithTelecom(CallsManager.CAPABILITY_BASELINE)
      manager = it
    }

  private fun emitRoute(entry: Tracked) {
    if (routeTarget() !== entry) return
    val available = entry.endpoints.map { routeName(it) }
    val names = entry.endpoints.map { it.name.toString() }
    Log.d(TAG, "route current=${routeName(entry.current)} available=$available call=${entry.callSid}")
    onAudioRoute?.invoke(entry.callSid, routeName(entry.current), available, names)
  }

  private fun routeName(endpoint: CallEndpointCompat?) = when (endpoint?.type) {
    CallEndpointCompat.TYPE_SPEAKER -> "speaker"
    CallEndpointCompat.TYPE_BLUETOOTH -> "bluetooth"
    CallEndpointCompat.TYPE_WIRED_HEADSET -> "wired"
    CallEndpointCompat.TYPE_EARPIECE -> "earpiece"
    else -> "unknown"
  }
}
