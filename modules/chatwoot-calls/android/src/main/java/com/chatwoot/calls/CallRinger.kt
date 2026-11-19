package com.chatwoot.calls

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioManager
import android.media.Ringtone
import android.media.RingtoneManager
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.os.VibrationEffect
import android.os.Vibrator

internal class CallRinger(private val context: Context) {
  private var ringtone: Ringtone? = null
  private var vibrator: Vibrator? = null
  private val handler = Handler(Looper.getMainLooper())

  // Replay where native looping is unavailable.
  private val replay = object : Runnable {
    override fun run() {
      val current = ringtone ?: return
      runCatching { if (!current.isPlaying) current.play() }
      handler.postDelayed(this, REPLAY_CHECK_MS)
    }
  }

  fun start() {
    val audio = context.getSystemService(AudioManager::class.java)
    if (audio?.ringerMode == AudioManager.RINGER_MODE_SILENT) return
    if (audio?.ringerMode == AudioManager.RINGER_MODE_NORMAL) {
      runCatching {
        val uri = RingtoneManager.getActualDefaultRingtoneUri(context, RingtoneManager.TYPE_RINGTONE)
          ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE)
        ringtone = RingtoneManager.getRingtone(context, uri)?.apply {
          audioAttributes = AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_NOTIFICATION_RINGTONE)
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
            .build()
          if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) isLooping = true
          play()
        }
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.P) {
          handler.postDelayed(replay, REPLAY_CHECK_MS)
        }
      }
    }
    runCatching {
      vibrator = context.getSystemService(Vibrator::class.java)
      vibrator?.vibrate(VibrationEffect.createWaveform(longArrayOf(0, 700, 900), 0))
    }
  }

  fun stop() {
    handler.removeCallbacks(replay)
    runCatching { ringtone?.stop() }
    ringtone = null
    runCatching { vibrator?.cancel() }
    vibrator = null
  }

  private companion object {
    const val REPLAY_CHECK_MS = 500L
  }
}
