package com.chatwoot.calls

// Carries what the agent does on the native call screen to the module, which forwards it
// to JavaScript. The screen exists before the module does, so it is looked up late.
object NativeCallBridge {
  @Volatile
  var onAction: ((action: String, enabled: Boolean?, callSid: String?) -> Unit)? = null

  // Whether anyone was listening. An action about one call names it, so the app acts on
  // that call and not whichever happens to be showing.
  // Whether JavaScript has a listener for the actions; until it does, an action sent would
  // be dropped, so callers keep it some other way
  @Volatile var listening = false

  fun emit(action: String, enabled: Boolean? = null, callSid: String? = null): Boolean {
    if (!listening) return false
    val listener = onAction ?: return false
    listener(action, enabled, callSid)
    return true
  }
}
