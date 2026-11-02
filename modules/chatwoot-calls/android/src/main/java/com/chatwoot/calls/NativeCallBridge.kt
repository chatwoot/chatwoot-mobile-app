package com.chatwoot.calls

// Screens can precede module initialization.
object NativeCallBridge {
  @Volatile
  var onAction: ((action: String, enabled: Boolean?, callSid: String?) -> Unit)? = null

  @Volatile var listening = false

  fun emit(action: String, enabled: Boolean? = null, callSid: String? = null): Boolean {
    if (!listening) return false
    val listener = onAction ?: return false
    listener(action, enabled, callSid)
    return true
  }
}
