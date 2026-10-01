package com.chatwoot.calls

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioManager
import android.media.Ringtone
import android.media.RingtoneManager
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator

// The phone's own ringtone and a vibration pattern for as long as a call rings natively
internal class CallRinger(private val context: Context) {
  private var ringtone: Ringtone? = null
  private var vibrator: Vibrator? = null

  fun start() {
    val audio = context.getSystemService(AudioManager::class.java)
    if (audio?.ringerMode != AudioManager.RINGER_MODE_SILENT) {
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
      }
    }
    runCatching {
      vibrator = context.getSystemService(Vibrator::class.java)
      vibrator?.vibrate(VibrationEffect.createWaveform(longArrayOf(0, 700, 900), 0))
    }
  }

  fun stop() {
    runCatching { ringtone?.stop() }
    ringtone = null
    runCatching { vibrator?.cancel() }
    vibrator = null
  }
}
