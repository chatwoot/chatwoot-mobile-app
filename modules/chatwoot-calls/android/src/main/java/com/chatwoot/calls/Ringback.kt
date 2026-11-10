package com.chatwoot.calls

import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioTrack
import kotlin.math.PI
import kotlin.math.min
import kotlin.math.sin

object Ringback {
  private const val RATE = 8000
  private val PATTERN = listOf(0.4 to true, 0.2 to false, 0.4 to true, 2.0 to false)
  // Fades prevent clicks at burst boundaries.
  private const val FADE_SAMPLES = 80

  private var track: AudioTrack? = null

  @Synchronized
  fun start() {
    if (track != null) return
    val pcm = samples()
    val built = AudioTrack.Builder()
      .setAudioAttributes(
        AudioAttributes.Builder()
          .setUsage(AudioAttributes.USAGE_VOICE_COMMUNICATION)
          .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
          .build()
      )
      .setAudioFormat(
        AudioFormat.Builder()
          .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
          .setSampleRate(RATE)
          .setChannelMask(AudioFormat.CHANNEL_OUT_MONO)
          .build()
      )
      .setTransferMode(AudioTrack.MODE_STATIC)
      .setBufferSizeInBytes(pcm.size * 2)
      .build()
    built.write(pcm, 0, pcm.size)
    built.setLoopPoints(0, pcm.size, -1)
    built.play()
    track = built
  }

  @Synchronized
  fun stop() {
    val current = track ?: return
    track = null
    runCatching { current.stop() }
    current.release()
  }

  private fun samples(): ShortArray {
    val out = ArrayList<Short>()
    var t = 0
    PATTERN.forEach { (seconds, on) ->
      val count = (seconds * RATE).toInt()
      for (i in 0 until count) {
        val value = if (on) {
          val time = t.toDouble() / RATE
          val fade = min(1.0, min(i, count - i).toDouble() / FADE_SAMPLES)
          (sin(2 * PI * 400 * time) + sin(2 * PI * 450 * time)) * 0.25 * fade
        } else 0.0
        out.add((value * Short.MAX_VALUE).toInt().toShort())
        t++
      }
    }
    return out.toShortArray()
  }
}
