package com.chatwoot.calls

import android.app.Activity
import android.app.Application
import android.os.Bundle

// Whether the app's own activity is in front. The messaging service is in the same
// process, so it can tell a call push for an app the agent is looking at from one that
// has to ring on its own. The call screen's own activity does not count as the app.
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
