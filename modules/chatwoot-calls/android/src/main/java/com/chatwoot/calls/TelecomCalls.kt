package com.chatwoot.calls

import android.content.Context
import android.net.Uri
import android.os.Build
import android.telecom.DisconnectCause
import android.util.Log
import android.media.AudioDeviceInfo
import android.media.AudioManager
import androidx.core.telecom.CallAttributesCompat
import androidx.core.telecom.CallControlResult
import androidx.core.telecom.CallControlScope
import androidx.core.telecom.CallEndpointCompat
import androidx.core.telecom.CallsManager
import java.util.concurrent.ConcurrentHashMap
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

// Registers each call with Android's Telecom framework, the counterpart of CallKit. The
// system then routes audio to Bluetooth, car and watch, treats the call as a phone call
// for do-not-disturb and a cellular call arriving mid-call, and shows its own in-call
// chip. The ring screen and notification stay ours; Telecom is told when the call is
// answered, connected and ended, and asked for audio route changes.
object TelecomCalls {
  private const val TAG = "TelecomCalls"
  private const val ROUTE_SETTLE_MS = 700L
  private const val AUTO_RESUME_POLL_MS = 1000L

  private class Tracked(val callSid: String) {
    @Volatile var scope: CallControlScope? = null
    @Volatile var active = false
    @Volatile var held = false
    @Volatile var userHeld = false
    @Volatile var endPending: DisconnectCause? = null
    @Volatile var endingLocally = false
    @Volatile var endpoints: List<CallEndpointCompat> = emptyList()
    @Volatile var current: CallEndpointCompat? = null
  }

  private val tracked = ConcurrentHashMap<String, Tracked>()
  private val mainScope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
  private var manager: CallsManager? = null
  @Volatile private var appContext: Context? = null

  // The agent acted on a system surface such as a headset button or a watch
  @Volatile var onSystemAnswer: ((callSid: String) -> Unit)? = null
  @Volatile var onSystemDisconnect: ((callSid: String) -> Unit)? = null
  // The system put the call on hold, or took it back: a cellular call was answered or ended
  @Volatile var onSystemHold: ((callSid: String, held: Boolean) -> Unit)? = null
  // The audio route changed, or the set of routes did; names are the devices' own
  @Volatile var onAudioRoute: ((callSid: String, current: String, available: List<String>, names: List<String>) -> Unit)? = null

  // Telecom needs Android 8. The debug property lets a tester run without it:
  // adb shell setprop debug.chatwoot.telecom 0
  val supported: Boolean
    get() = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && debugProperty("debug.chatwoot.telecom") != "0"

  private fun debugProperty(name: String): String? = runCatching {
    val clazz = Class.forName("android.os.SystemProperties")
    clazz.getMethod("get", String::class.java).invoke(null, name) as? String
  }.getOrNull()

  fun add(context: Context, callSid: String, displayName: String, handle: String, outgoing: Boolean) {
    if (!supported || tracked.containsKey(callSid)) return
    appContext = context.applicationContext
    val entry = Tracked(callSid)
    tracked[callSid] = entry
    val attributes = CallAttributesCompat(
      displayName.ifBlank { "Call" },
      Uri.fromParts("tel", handle.ifBlank { callSid }, null),
      if (outgoing) CallAttributesCompat.DIRECTION_OUTGOING else CallAttributesCompat.DIRECTION_INCOMING,
      CallAttributesCompat.CALL_TYPE_AUDIO_CALL,
      CallAttributesCompat.SUPPORTS_SET_INACTIVE
    )
    mainScope.launch {
      try {
        manager(context).addCall(
          attributes,
          onAnswer = { onSystemAnswer?.invoke(callSid) },
          onDisconnect = { if (!entry.endingLocally) onSystemDisconnect?.invoke(callSid) },
          onSetActive = { markHeld(entry, false) },
          onSetInactive = {
            markHeld(entry, true)
            if (!entry.userHeld) autoResume(entry)
          }
        ) {
          entry.scope = this
          // Marked active before the scope existed: catch up now
          if (entry.active) launch { setActive() }
          launch {
            availableEndpoints.collect { list ->
              entry.endpoints = list
              emitRoute(entry)
            }
          }
          launch {
            currentCallEndpoint.collect { endpoint ->
              entry.current = endpoint
              emitRoute(entry)
            }
          }
          entry.endPending?.let { cause -> launch { disconnect(cause) } }
        }
      } catch (e: Exception) {
        Log.w(TAG, "call $callSid could not be tracked: ${e.message}")
      } finally {
        tracked.remove(callSid)
      }
    }
  }

  fun setActive(callSid: String) {
    val entry = tracked[callSid] ?: return
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
    scope.launch {
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
    val cause = DisconnectCause(
      when (reason) {
        "rejected", "declined" -> DisconnectCause.REJECTED
        "missed", "no_answer", "unanswered" -> DisconnectCause.MISSED
        "local" -> DisconnectCause.LOCAL
        "failed", "error" -> DisconnectCause.ERROR
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

  fun endAll(reason: String) {
    tracked.keys.toList().forEach { end(it, reason) }
  }

  fun tracks(callSid: String): Boolean = tracked.containsKey(callSid)

  // Speaker on, or the best non-speaker route available: Bluetooth, then a wired headset,
  // then the earpiece. Returns false when no tracked call can take the request.
  fun setSpeaker(enabled: Boolean): Boolean {
    val entry = tracked.values.firstOrNull { it.scope != null } ?: return false
    val wanted = if (enabled) {
      entry.endpoints.firstOrNull { it.type == CallEndpointCompat.TYPE_SPEAKER }
    } else {
      listOf(CallEndpointCompat.TYPE_BLUETOOTH, CallEndpointCompat.TYPE_WIRED_HEADSET, CallEndpointCompat.TYPE_EARPIECE)
        .firstNotNullOfOrNull { type -> entry.endpoints.firstOrNull { it.type == type } }
    } ?: return false
    return request(entry, wanted)
  }

  // A specific route by name; false when it is not on offer for the tracked call
  fun setRoute(route: String): Boolean {
    val entry = tracked.values.firstOrNull { it.scope != null } ?: return false
    val wanted = entry.endpoints.firstOrNull { routeName(it) == route } ?: return false
    return request(entry, wanted)
  }

  fun currentRoute(): Triple<String, List<String>, List<String>> {
    val entry = tracked.values.firstOrNull { it.scope != null } ?: return Triple("unknown", emptyList(), emptyList())
    return Triple(routeName(entry.current), entry.endpoints.map { routeName(it) }, entry.endpoints.map { it.name.toString() })
  }

  // Telecom is asked first; when it declines, the route is set on the audio manager
  // directly, which is what the system would have done for the request
  private fun request(entry: Tracked, endpoint: CallEndpointCompat): Boolean {
    val scope = entry.scope ?: return false
    scope.launch {
      val result = scope.requestEndpointChange(endpoint)
      if (result !is CallControlResult.Success) {
        routeDirectly(entry, endpoint)
        return@launch
      }
      // Telecom can accept a request and leave the audio where it was; the route is set
      // directly when the endpoint has not followed within a moment
      kotlinx.coroutines.delay(ROUTE_SETTLE_MS)
      if (entry.current?.type != endpoint.type) routeDirectly(entry, endpoint)
    }
    return true
  }

  private fun routeDirectly(entry: Tracked, endpoint: CallEndpointCompat) {
    routeDirectly(endpoint.type)
    // Telecom will not report a route it did not set itself
    entry.current = endpoint
    emitRoute(entry)
  }

  private fun routeDirectly(type: Int) {
    val audio = appContext?.getSystemService(Context.AUDIO_SERVICE) as? AudioManager ?: return
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      val wanted = when (type) {
        CallEndpointCompat.TYPE_SPEAKER -> listOf(AudioDeviceInfo.TYPE_BUILTIN_SPEAKER)
        CallEndpointCompat.TYPE_BLUETOOTH -> listOf(AudioDeviceInfo.TYPE_BLUETOOTH_SCO, AudioDeviceInfo.TYPE_BLE_HEADSET)
        CallEndpointCompat.TYPE_WIRED_HEADSET -> listOf(AudioDeviceInfo.TYPE_WIRED_HEADSET, AudioDeviceInfo.TYPE_WIRED_HEADPHONES, AudioDeviceInfo.TYPE_USB_HEADSET)
        else -> listOf(AudioDeviceInfo.TYPE_BUILTIN_EARPIECE)
      }
      val device = audio.availableCommunicationDevices.firstOrNull { it.type in wanted }
      device?.let { audio.setCommunicationDevice(it) }
      return
    }
    @Suppress("DEPRECATION")
    when (type) {
      CallEndpointCompat.TYPE_SPEAKER -> {
        audio.stopBluetoothSco(); audio.isBluetoothScoOn = false; audio.isSpeakerphoneOn = true
      }
      CallEndpointCompat.TYPE_BLUETOOTH -> {
        audio.isSpeakerphoneOn = false; audio.startBluetoothSco(); audio.isBluetoothScoOn = true
      }
      else -> {
        audio.stopBluetoothSco(); audio.isBluetoothScoOn = false; audio.isSpeakerphoneOn = false
      }
    }
  }

  private fun manager(context: Context): CallsManager =
    manager ?: CallsManager(context.applicationContext).also {
      it.registerAppWithTelecom(CallsManager.CAPABILITY_BASELINE)
      manager = it
    }

  private fun emitRoute(entry: Tracked) {
    val available = entry.endpoints.map { routeName(it) }
    val names = entry.endpoints.map { it.name.toString() }
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
