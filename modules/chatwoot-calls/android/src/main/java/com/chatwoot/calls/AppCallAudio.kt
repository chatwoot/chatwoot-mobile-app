package com.chatwoot.calls

import android.Manifest
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.media.AudioDeviceCallback
import android.media.AudioDeviceInfo
import android.media.AudioManager
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.util.Log
import java.util.UUID

@Suppress("DEPRECATION")
internal class AppCallAudio(private val context: Context) {
  companion object {
    val supported: Boolean get() = Build.VERSION.SDK_INT < Build.VERSION_CODES.UPSIDE_DOWN_CAKE
    private const val TAG = "AppCallAudio"
  }

  private val audio = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
  private val main = Handler(Looper.getMainLooper())
  private var session: Session? = null
  @Volatile private var snapshot = Triple("unknown", emptyList<String>(), emptyList<String>())
  var onRoute: ((String, List<String>, List<String>) -> Unit)? = null

  private inner class Session(val token: String) {
    var choice = "default"
    var requestedDevice: Int? = null
    var scoConnected = false
    var stopObserving: (() -> Unit)? = null
    val devices = object : AudioDeviceCallback() {
      override fun onAudioDevicesAdded(added: Array<AudioDeviceInfo>) = devicesChanged(this@Session)
      override fun onAudioDevicesRemoved(removed: Array<AudioDeviceInfo>) = devicesChanged(this@Session)
    }
    val focus = AudioManager.OnAudioFocusChangeListener { change ->
      main.post {
        if (session === this) {
          Log.i(TAG, "focus=$change")
          if (change == AudioManager.AUDIOFOCUS_GAIN) applyChoice(this, force = true)
        }
      }
    }
    val sco = object : BroadcastReceiver() {
      override fun onReceive(context: Context?, intent: Intent?) {
        if (session !== this@Session) return
        scoConnected = intent?.getIntExtra(AudioManager.EXTRA_SCO_AUDIO_STATE, -1) == AudioManager.SCO_AUDIO_STATE_CONNECTED
        if (scoConnected && routeForRequestedDevice() != "bluetooth") {
          audio.stopBluetoothSco()
          audio.isBluetoothScoOn = false
          scoConnected = false
        }
        publish(this@Session)
      }
    }

    fun routeForRequestedDevice() = availableDevices().firstOrNull { it.id == requestedDevice }?.let(::routeName)
  }

  // Tokens protect newer media sessions.
  fun start(): String {
    val token = UUID.randomUUID().toString()
    main.post {
      stopCurrent()
      val next = Session(token)
      session = next
      clearRoute()
      audio.mode = AudioManager.MODE_IN_COMMUNICATION
      val focus = audio.requestAudioFocus(next.focus, AudioManager.STREAM_VOICE_CALL, AudioManager.AUDIOFOCUS_GAIN_TRANSIENT)
      Log.i(TAG, "start sdk=${Build.VERSION.SDK_INT} focus=$focus")
      audio.registerAudioDeviceCallback(next.devices, main)
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        observeCommunicationDevice(next)
      } else {
        context.registerReceiver(next.sco, IntentFilter(AudioManager.ACTION_SCO_AUDIO_STATE_UPDATED), null, main)
        next.stopObserving = { context.unregisterReceiver(next.sco) }
      }
      applyChoice(next)
    }
    return token
  }

  fun stop(token: String) {
    main.post { if (session?.token == token) stopCurrent() }
  }

  fun destroy() {
    main.post { stopCurrent() }
  }

  fun setRoute(route: String) {
    main.post {
      val current = session ?: return@post
      if (route != "default" && availableDevices().none { routeName(it) == route }) {
        Log.w(TAG, "route unavailable=$route")
        publish(current)
        return@post
      }
      current.choice = route
      applyChoice(current, force = true)
    }
  }

  fun currentRoute() = snapshot

  @android.annotation.TargetApi(31)
  private fun observeCommunicationDevice(current: Session) {
    val listener = AudioManager.OnCommunicationDeviceChangedListener {
      if (session === current) publish(current)
    }
    audio.addOnCommunicationDeviceChangedListener({ runnable -> main.post(runnable) }, listener)
    current.stopObserving = { audio.removeOnCommunicationDeviceChangedListener(listener) }
  }

  private fun devicesChanged(current: Session) {
    if (session !== current) return
    val devices = availableDevices()
    if (current.choice != "default" && devices.none { routeName(it) == current.choice }) {
      current.choice = "default"
    }
    applyChoice(current)
  }

  private fun applyChoice(current: Session, force: Boolean = false) {
    if (session !== current) return
    val devices = availableDevices()
    val target = if (current.choice == "default") {
      listOf("bluetooth", "wired", "earpiece", "speaker").firstNotNullOfOrNull { name ->
        devices.firstOrNull { routeName(it) == name }
      }
    } else devices.firstOrNull { routeName(it) == current.choice }
    if (target != null && (force || target.id != current.requestedDevice)) {
      current.requestedDevice = target.id
      val route = routeName(target)
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        val accepted = runCatching { audio.setCommunicationDevice(target) }.getOrDefault(false)
        Log.i(TAG, "route requested=$route accepted=$accepted current=${routeName(audio.communicationDevice)}")
      } else {
        if (route == "bluetooth") {
          audio.isSpeakerphoneOn = false
          audio.startBluetoothSco()
          audio.isBluetoothScoOn = true
        } else {
          audio.stopBluetoothSco()
          audio.isBluetoothScoOn = false
          current.scoConnected = false
          audio.isSpeakerphoneOn = route == "speaker"
        }
        Log.i(TAG, "route requested=$route scoConnected=${current.scoConnected}")
      }
    }
    publish(current)
  }

  private fun availableDevices(): List<AudioDeviceInfo> {
    val devices = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      audio.availableCommunicationDevices
    } else audio.getDevices(AudioManager.GET_DEVICES_OUTPUTS).toList()
    val bluetoothAllowed = Build.VERSION.SDK_INT < Build.VERSION_CODES.S ||
      context.checkSelfPermission(Manifest.permission.BLUETOOTH_CONNECT) == PackageManager.PERMISSION_GRANTED
    val wired = devices.any { routeName(it) == "wired" }
    return devices.filter {
      val route = routeName(it)
      route != "unknown" && (route != "bluetooth" || bluetoothAllowed) &&
        // Wired headsets override legacy handset routing.
        !(Build.VERSION.SDK_INT < Build.VERSION_CODES.S && wired && route == "earpiece")
    }.distinctBy(::routeName)
  }

  private fun publish(current: Session) {
    if (session !== current) return
    val devices = availableDevices()
    val route = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      routeName(audio.communicationDevice)
    } else when {
      current.scoConnected && audio.isBluetoothScoOn -> "bluetooth"
      audio.isSpeakerphoneOn -> "speaker"
      devices.any { routeName(it) == "wired" } -> "wired"
      devices.any { routeName(it) == "earpiece" } -> "earpiece"
      else -> "unknown"
    }
    snapshot = Triple(route, devices.map(::routeName), devices.map { it.productName.toString() })
    Log.d(TAG, "route current=$route available=${snapshot.second}")
    onRoute?.invoke(snapshot.first, snapshot.second, snapshot.third)
  }

  private fun stopCurrent() {
    val previous = session ?: return
    session = null
    audio.unregisterAudioDeviceCallback(previous.devices)
    previous.stopObserving?.invoke()
    clearRoute()
    audio.mode = AudioManager.MODE_NORMAL
    audio.abandonAudioFocus(previous.focus)
    snapshot = Triple("unknown", emptyList(), emptyList())
    Log.i(TAG, "routing ended")
  }

  private fun clearRoute() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) audio.clearCommunicationDevice()
    else {
      audio.stopBluetoothSco()
      audio.isBluetoothScoOn = false
      audio.isSpeakerphoneOn = false
    }
  }

  private fun routeName(device: AudioDeviceInfo?) = when (device?.type) {
    AudioDeviceInfo.TYPE_BUILTIN_EARPIECE -> "earpiece"
    AudioDeviceInfo.TYPE_BUILTIN_SPEAKER -> "speaker"
    AudioDeviceInfo.TYPE_BLUETOOTH_SCO, AudioDeviceInfo.TYPE_BLE_HEADSET -> "bluetooth"
    AudioDeviceInfo.TYPE_WIRED_HEADSET, AudioDeviceInfo.TYPE_WIRED_HEADPHONES,
    AudioDeviceInfo.TYPE_USB_HEADSET, AudioDeviceInfo.TYPE_USB_DEVICE -> "wired"
    else -> "unknown"
  }
}
