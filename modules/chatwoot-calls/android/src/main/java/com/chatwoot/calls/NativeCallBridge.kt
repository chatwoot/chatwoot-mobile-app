package com.chatwoot.calls

// Carries what the agent does on the native call screen to the module, which forwards it
// to JavaScript. The screen exists before the module does, so it is looked up late.
object NativeCallBridge {
  @Volatile
  var onAction: ((action: String, enabled: Boolean?, callSid: String?) -> Unit)? = null

  // Whether anyone was listening. An action about one call names it, so the app acts on
  // that call and not whichever happens to be showing.
  fun emit(action: String, enabled: Boolean? = null, callSid: String? = null): Boolean {
    val listener = onAction ?: return false
    listener(action, enabled, callSid)
    return true
  }
}
