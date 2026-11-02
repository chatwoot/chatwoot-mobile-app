package com.chatwoot.calls

import android.app.Activity
import android.app.Application
import android.os.Bundle

// Excludes the lock-screen call activity.
object AppVisibility {
  @Volatile
  var foreground = false

  private var tracking = false

  fun track(application: Application) {
    if (tracking) return
    tracking = true
    application.registerActivityLifecycleCallbacks(object : Application.ActivityLifecycleCallbacks {
      override fun onActivityResumed(activity: Activity) {
        if (activity !is IncomingCallActivity) foreground = true
      }

      override fun onActivityPaused(activity: Activity) {
        if (activity !is IncomingCallActivity) foreground = false
      }

      override fun onActivityCreated(activity: Activity, savedInstanceState: Bundle?) {}
      override fun onActivityStarted(activity: Activity) {}
      override fun onActivityStopped(activity: Activity) {}
      override fun onActivitySaveInstanceState(activity: Activity, outState: Bundle) {}
      override fun onActivityDestroyed(activity: Activity) {}
    })
  }
}
