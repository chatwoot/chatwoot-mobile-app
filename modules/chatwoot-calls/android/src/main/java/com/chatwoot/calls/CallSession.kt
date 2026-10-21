package com.chatwoot.calls

import android.content.Context

// Whether an agent is signed in to the app, as it last reported; one that never reported
// counts as signed in. Read when a call push arrives, which may be before JavaScript runs.
object CallSession {
  private const val PREFS = "chatwoot_calls_session"
  private const val KEY_SIGNED_IN = "signed_in"

  fun setSignedIn(context: Context, signedIn: Boolean) {
    context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putBoolean(KEY_SIGNED_IN, signedIn).apply()
  }

  fun isSignedIn(context: Context): Boolean =
    context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getBoolean(KEY_SIGNED_IN, true)
}
