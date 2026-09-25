package com.chatwoot.calls

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.PorterDuff
import android.graphics.PorterDuffXfermode
import android.graphics.Rect
import java.net.HttpURLConnection
import java.net.URL

// Fetches a contact's photo for the call notifications, cropped to a circle. Callers post
// their notification first and update it once the photo is in, so the ring never waits.
object ContactPhoto {
  private const val TIMEOUT_MS = 4000
  private const val SIZE_PX = 256

  fun fetch(url: String?): Bitmap? {
    if (url.isNullOrBlank()) return null
    val source = runCatching {
      (URL(url).openConnection() as HttpURLConnection).run {
        connectTimeout = TIMEOUT_MS
        readTimeout = TIMEOUT_MS
        inputStream.use { BitmapFactory.decodeStream(it) }
      }
    }.getOrNull() ?: return null
    return circle(source)
  }

  fun fetchAsync(url: String?, onLoaded: (Bitmap) -> Unit) {
    if (url.isNullOrBlank()) return
    Thread { fetch(url)?.let(onLoaded) }.start()
  }

  private fun circle(source: Bitmap): Bitmap {
    val side = minOf(source.width, source.height)
    val left = (source.width - side) / 2
    val top = (source.height - side) / 2
    val output = Bitmap.createBitmap(SIZE_PX, SIZE_PX, Bitmap.Config.ARGB_8888)
    val canvas = Canvas(output)
    val paint = Paint(Paint.ANTI_ALIAS_FLAG)
    canvas.drawCircle(SIZE_PX / 2f, SIZE_PX / 2f, SIZE_PX / 2f, paint)
    paint.xfermode = PorterDuffXfermode(PorterDuff.Mode.SRC_IN)
    canvas.drawBitmap(source, Rect(left, top, left + side, top + side), Rect(0, 0, SIZE_PX, SIZE_PX), paint)
    return output
  }
}
