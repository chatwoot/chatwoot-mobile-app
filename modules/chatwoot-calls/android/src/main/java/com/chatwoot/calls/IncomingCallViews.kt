package com.chatwoot.calls

import android.animation.ValueAnimator
import android.content.Context
import android.content.res.ColorStateList
import android.graphics.Bitmap
import android.graphics.Color
import android.graphics.Outline
import android.graphics.Typeface
import android.graphics.drawable.ColorDrawable
import android.graphics.drawable.Drawable
import android.graphics.drawable.GradientDrawable
import android.graphics.drawable.LayerDrawable
import android.text.TextUtils
import android.util.TypedValue
import android.view.Gravity
import android.view.View
import android.view.ViewOutlineProvider
import android.view.animation.PathInterpolator
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView

// The native call screen's views: the header, the caller with the sonar discs, and the
// two trays. The activity owns the state and tells this what to show.
internal class IncomingCallViews(private val context: Context) {
  var stateLabel: TextView? = null
    private set
  private var trayHost: FrameLayout? = null
  private var avatarView: FrameLayout? = null
  private val sonarAnimators = mutableListOf<ValueAnimator>()

  fun buildLayout(callerName: String, callerPhone: String, inboxName: String): View {
    val root = LinearLayout(context).apply {
      orientation = LinearLayout.VERTICAL
      background = washBackground()
      setPadding(0, dp(12), 0, dp(16))
      clipChildren = false
      clipToPadding = false
    }
    root.addView(header(), LinearLayout.LayoutParams(MATCH, WRAP))

    val centre = LinearLayout(context).apply {
      orientation = LinearLayout.VERTICAL
      gravity = Gravity.CENTER
      setPadding(dp(32), 0, dp(32), dp(40))
      clipChildren = false
      clipToPadding = false
    }
    val state = text("Incoming call", 17f, STATE, medium = true)
    stateLabel = state
    centre.addView(state, LinearLayout.LayoutParams(WRAP, WRAP).apply { bottomMargin = dp(24) })
    centre.addView(avatarWithSonar(callerName), LinearLayout.LayoutParams(dp(132), dp(132)))
    centre.addView(text(callerName.ifEmpty { "Unknown caller" }, 30f, INK, bold = true), params(dp(26)))
    if (callerPhone.isNotEmpty()) centre.addView(text(callerPhone, 17f, MUTED), params(dp(6)))
    if (inboxName.isNotEmpty()) {
      centre.addView(
        text(inboxName, 17f, MUTED).apply { maxLines = 1; ellipsize = TextUtils.TruncateAt.END },
        params(dp(6))
      )
    }
    root.addView(centre, LinearLayout.LayoutParams(MATCH, 0).apply { weight = 1f })

    val host = FrameLayout(context).apply {
      setPadding(dp(16), dp(16), dp(16), dp(16))
      background = GradientDrawable().apply {
        cornerRadius = dp(24).toFloat()
        setColor(Color.parseColor(SURFACE))
      }
      elevation = dp(4).toFloat()
    }
    trayHost = host
    root.addView(host, LinearLayout.LayoutParams(MATCH, WRAP).apply {
      marginStart = dp(20)
      marginEnd = dp(20)
    })
    return root
  }

  // Decline and Answer as two wide buttons side by side
  fun showRingingTray(onDecline: () -> Unit, onAnswer: () -> Unit) {
    trayHost?.setPadding(dp(16), dp(16), dp(16), dp(16))
    val tray = LinearLayout(context).apply {
      orientation = LinearLayout.HORIZONTAL
      gravity = Gravity.CENTER
    }
    tray.addView(
      wideButton("Decline", DECLINE, R.drawable.cw_call_decline, onDecline),
      LinearLayout.LayoutParams(0, dp(44)).apply { weight = 1f; marginEnd = dp(16) }
    )
    tray.addView(
      wideButton("Answer", ANSWER, R.drawable.cw_call_answer, onAnswer),
      LinearLayout.LayoutParams(0, dp(44)).apply { weight = 1f }
    )
    replaceTray(tray)
  }

  // The in-call controls, faded while the call connects; End works throughout
  fun showInCallTray(
    muted: Boolean,
    speakerOn: Boolean,
    enabled: Boolean,
    onMute: () -> Unit,
    onSpeaker: () -> Unit,
    onEnd: () -> Unit
  ) {
    trayHost?.setPadding(dp(16), dp(16), dp(16), dp(16))
    val tray = LinearLayout(context).apply {
      orientation = LinearLayout.HORIZONTAL
      gravity = Gravity.CENTER
    }
    val mute = callButton(
      if (muted) "Unmute" else "Mute",
      TOGGLE,
      if (muted) R.drawable.cw_call_mic_off else R.drawable.cw_call_mic,
      GLYPH_OFF,
      enabled,
      onMute
    )
    val speaker = callButton(
      "Speaker",
      if (speakerOn) TOGGLE_ON else TOGGLE,
      R.drawable.cw_call_speaker,
      if (speakerOn) GLYPH_ON else GLYPH_OFF,
      enabled,
      onSpeaker
    )
    val hold = callButton("Hold", null, R.drawable.cw_call_hold, GLYPH_DISABLED, false) {}
    val end = callButton("End call", DECLINE, R.drawable.cw_call_decline, WHITE, onPress = onEnd)
    // Four 60dp columns spread across the tray, the outer ones against its edges
    val columns = listOf(mute, speaker, hold, end)
    columns.forEachIndexed { index, column ->
      tray.addView(column, LinearLayout.LayoutParams(dp(60), WRAP))
      if (index < columns.lastIndex) {
        tray.addView(View(context), LinearLayout.LayoutParams(0, 0).apply { weight = 1f })
      }
    }
    replaceTray(tray)
  }

  // The caller's photo, once it has been fetched, in place of the initial
  fun showAvatar(bitmap: Bitmap) {
    val frame = avatarView ?: return
    frame.removeAllViews()
    frame.addView(
      ImageView(context).apply {
        setImageBitmap(bitmap)
        scaleType = ImageView.ScaleType.CENTER_CROP
      },
      FrameLayout.LayoutParams(MATCH, MATCH)
    )
  }

  fun stopSonar() {
    sonarAnimators.forEach { it.cancel() }
    sonarAnimators.clear()
  }

  private fun replaceTray(tray: View) {
    trayHost?.removeAllViews()
    trayHost?.addView(tray, FrameLayout.LayoutParams(MATCH, WRAP))
  }

  // The light ground with a soft wash of the ring colour behind the caller
  private fun washBackground(): Drawable {
    val width = context.resources.displayMetrics.widthPixels
    val wash = GradientDrawable(
      GradientDrawable.Orientation.TOP_BOTTOM,
      intArrayOf(Color.parseColor(WASH), Color.TRANSPARENT)
    ).apply {
      gradientType = GradientDrawable.RADIAL_GRADIENT
      gradientRadius = width * 0.6f
      setGradientCenter(0.5f, 0.34f)
    }
    return LayerDrawable(arrayOf(ColorDrawable(Color.parseColor(BACKGROUND)), wash))
  }

  private fun header(): View {
    val row = LinearLayout(context).apply {
      orientation = LinearLayout.HORIZONTAL
      gravity = Gravity.CENTER_VERTICAL
      setPadding(dp(20), dp(10), dp(20), dp(10))
    }
    runCatching { context.packageManager.getApplicationIcon(context.packageName) }.getOrNull()?.let { icon ->
      row.addView(
        ImageView(context).apply { setImageDrawable(icon) },
        LinearLayout.LayoutParams(dp(20), dp(20)).apply { marginEnd = dp(12) }
      )
    }
    row.addView(
      text(TITLE, 17f, INK, medium = true).apply {
        gravity = Gravity.START
        maxLines = 1
        ellipsize = TextUtils.TruncateAt.END
      },
      LinearLayout.LayoutParams(0, WRAP).apply { weight = 1f }
    )
    return row
  }

  // While ringing, two translucent discs swell out from behind the avatar and dissolve
  private fun avatarWithSonar(callerName: String): View {
    val holder = FrameLayout(context).apply { clipChildren = false; clipToPadding = false }
    for (index in 0 until 2) {
      val disc = View(context).apply {
        background = GradientDrawable().apply {
          shape = GradientDrawable.OVAL
          setColor(Color.parseColor(SONAR))
        }
        alpha = 0f
      }
      holder.addView(disc, FrameLayout.LayoutParams(MATCH, MATCH))
      val grow = ValueAnimator.ofFloat(0f, 1f).apply {
        duration = SONAR_PERIOD_MS
        startDelay = index * SONAR_STAGGER_MS
        repeatCount = ValueAnimator.INFINITE
        interpolator = PathInterpolator(0.2f, 0.6f, 0.3f, 1f)
        addUpdateListener { animation ->
          val t = animation.animatedValue as Float
          disc.scaleX = 1f + t * 1.1f
          disc.scaleY = 1f + t * 1.1f
          disc.alpha = 0.45f * (1f - t)
        }
      }
      sonarAnimators.add(grow)
      grow.start()
    }
    holder.addView(avatar(callerName), FrameLayout.LayoutParams(MATCH, MATCH))
    return holder
  }

  // The initial in the ring colours until the photo arrives
  private fun avatar(callerName: String): View {
    val initial = callerName.trim().take(1).uppercase().ifEmpty { "?" }
    val frame = FrameLayout(context).apply {
      background = GradientDrawable().apply {
        shape = GradientDrawable.OVAL
        setColor(Color.parseColor(AVATAR_FILL))
      }
      clipToOutline = true
      outlineProvider = object : ViewOutlineProvider() {
        override fun getOutline(view: View, outline: Outline) {
          outline.setOval(0, 0, view.width, view.height)
        }
      }
    }
    frame.addView(
      TextView(context).apply {
        text = initial
        gravity = Gravity.CENTER
        setTextSize(TypedValue.COMPLEX_UNIT_SP, 56f)
        setTextColor(Color.parseColor(AVATAR_INK))
        setTypeface(typeface, Typeface.BOLD)
      },
      FrameLayout.LayoutParams(MATCH, MATCH)
    )
    avatarView = frame
    return frame
  }

  private fun wideButton(label: String, color: String, icon: Int, onPress: () -> Unit): View {
    val row = LinearLayout(context).apply {
      orientation = LinearLayout.HORIZONTAL
      gravity = Gravity.CENTER
      background = GradientDrawable().apply {
        cornerRadius = dp(12).toFloat()
        setColor(Color.parseColor(color))
      }
      isClickable = true
      setOnClickListener { onPress() }
    }
    val glyph = ImageView(context).apply {
      setImageResource(icon)
      scaleType = ImageView.ScaleType.CENTER_INSIDE
      imageTintList = ColorStateList.valueOf(Color.WHITE)
    }
    row.addView(glyph, LinearLayout.LayoutParams(dp(18), dp(18)).apply { marginEnd = dp(8) })
    row.addView(text(label, 15f, WHITE, bold = true), LinearLayout.LayoutParams(WRAP, WRAP))
    return row
  }

  // A tile with its label underneath. A null fill draws the outline of a control that has
  // nothing to act on yet.
  private fun callButton(
    label: String,
    fill: String?,
    icon: Int,
    glyphColor: String,
    enabled: Boolean = true,
    onPress: () -> Unit
  ): View {
    val column = LinearLayout(context).apply {
      orientation = LinearLayout.VERTICAL
      gravity = Gravity.CENTER_HORIZONTAL
      alpha = if (enabled || fill == null) 1f else 0.45f
      isEnabled = enabled
      if (enabled) setOnClickListener { onPress() }
    }
    val button = ImageView(context).apply {
      setImageResource(icon)
      scaleType = ImageView.ScaleType.CENTER_INSIDE
      setPadding(dp(17), dp(17), dp(17), dp(17))
      background = GradientDrawable().apply {
        cornerRadius = dp(18).toFloat()
        if (fill != null) setColor(Color.parseColor(fill))
        else setStroke(dp(1.5f), Color.parseColor(DISABLED_BORDER))
      }
      imageTintList = ColorStateList.valueOf(Color.parseColor(glyphColor))
      isClickable = false
    }
    column.addView(button, LinearLayout.LayoutParams(dp(60), dp(60)))
    column.addView(
      text(label, 13f, if (fill == null) LABEL_DISABLED else LABEL).apply {
        maxLines = 1
        ellipsize = TextUtils.TruncateAt.END
      },
      params(dp(8))
    )
    return column
  }

  private fun text(value: String, size: Float, color: String, bold: Boolean = false, medium: Boolean = false) =
    TextView(context).apply {
      this.text = value
      setTextSize(TypedValue.COMPLEX_UNIT_SP, size)
      setTextColor(Color.parseColor(color))
      gravity = Gravity.CENTER
      if (bold) setTypeface(typeface, Typeface.BOLD)
      else if (medium) typeface = Typeface.create("sans-serif-medium", Typeface.NORMAL)
    }

  private fun params(topMargin: Int) =
    LinearLayout.LayoutParams(MATCH, WRAP).apply { this.topMargin = topMargin }

  private fun dp(value: Int) = dp(value.toFloat())

  private fun dp(value: Float) =
    TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, value, context.resources.displayMetrics).toInt()

  companion object {
    const val BACKGROUND = "#F4F4F6"
    private const val TITLE = "Chatwoot Audio"
    private const val WASH = "#420880E7"
    private const val SURFACE = "#FFFFFF"
    private const val WHITE = "#FFFFFF"
    private const val INK = "#202020"
    private const val MUTED = "#737373"
    private const val LABEL = "#666666"
    private const val STATE = "#076CC5"
    private const val SONAR = "#2E0880E7"
    private const val SONAR_PERIOD_MS = 3200L
    private const val SONAR_STAGGER_MS = 1600L
    private const val AVATAR_FILL = "#D5EFFF"
    private const val AVATAR_INK = "#0D74CE"
    private const val TOGGLE = "#F2F2F4"
    private const val TOGGLE_ON = "#D5EFFF"
    private const val GLYPH_OFF = "#646464"
    private const val GLYPH_ON = "#0880EA"
    private const val GLYPH_DISABLED = "#B5B5BA"
    private const val DISABLED_BORDER = "#DFDFE2"
    private const val LABEL_DISABLED = "#ADADAD"
    private const val DECLINE = "#E54666"
    private const val ANSWER = "#12A594"
    private const val MATCH = LinearLayout.LayoutParams.MATCH_PARENT
    private const val WRAP = LinearLayout.LayoutParams.WRAP_CONTENT
  }
}
