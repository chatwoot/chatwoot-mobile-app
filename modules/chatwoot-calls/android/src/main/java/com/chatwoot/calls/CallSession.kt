package com.chatwoot.calls

import android.content.Context

object CallSession {
  private const val PREFS = "chatwoot_calls_session"
  private const val KEY_SIGNED_IN = "signed_in"

  fun setSignedIn(context: Context, signedIn: Boolean) {
    context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putBoolean(KEY_SIGNED_IN, signedIn).apply()
  }

  fun isSignedIn(context: Context): Boolean =
    context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getBoolean(KEY_SIGNED_IN, true)
}
