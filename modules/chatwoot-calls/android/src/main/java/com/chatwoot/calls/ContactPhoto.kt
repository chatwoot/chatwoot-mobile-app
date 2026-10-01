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

// Fetches a contact's photo for the call surfaces. Callers show the call first and update
// it once the photo is in, so the ring never waits. A photo is downloaded once, scaled
// down on decode, and kept for the other surfaces of the same call.
object ContactPhoto {
  private const val TIMEOUT_MS = 4000
  private const val SIZE_PX = 256
  private val cache = android.util.LruCache<String, Bitmap>(4)
  private val executor = java.util.concurrent.Executors.newSingleThreadExecutor()

  // The photo as downloaded, no larger than needed for the call screen's avatar
  fun load(url: String?): Bitmap? {
    if (url.isNullOrBlank()) return null
    cache.get(url)?.let { return it }
    val bytes = runCatching {
      (URL(url).openConnection() as HttpURLConnection).run {
        connectTimeout = TIMEOUT_MS
        readTimeout = TIMEOUT_MS
        inputStream.use { it.readBytes() }
      }
    }.getOrNull() ?: return null
    val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
    BitmapFactory.decodeByteArray(bytes, 0, bytes.size, bounds)
    var sample = 1
    while (minOf(bounds.outWidth, bounds.outHeight) / (sample * 2) >= SIZE_PX * 2) sample *= 2
    val source = BitmapFactory.decodeByteArray(
      bytes, 0, bytes.size, BitmapFactory.Options().apply { inSampleSize = sample }
    ) ?: return null
    cache.put(url, source)
    return source
  }

  // Cropped to a circle, for notifications
  fun fetch(url: String?): Bitmap? = load(url)?.let(::circle)

  fun fetchAsync(url: String?, onLoaded: (Bitmap) -> Unit) {
    if (url.isNullOrBlank()) return
    executor.execute { fetch(url)?.let(onLoaded) }
  }

  fun loadAsync(url: String?, onLoaded: (Bitmap) -> Unit) {
    if (url.isNullOrBlank()) return
    executor.execute { load(url)?.let(onLoaded) }
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
