package com.chatwoot.calls

// Carries what the agent does on the native call screen to the module, which forwards it
// to JavaScript. The screen exists before the module does, so it is looked up late.
object NativeCallBridge {
  @Volatile
  var onAction: ((action: String, enabled: Boolean?) -> Unit)? = null

  // Whether anyone was listening
  fun emit(action: String, enabled: Boolean? = null): Boolean {
    val listener = onAction ?: return false
    listener(action, enabled)
    return true
  }
}
