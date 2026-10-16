package expo.modules.appupdate

import android.app.Activity
import com.google.android.play.core.appupdate.AppUpdateInfo
import com.google.android.play.core.appupdate.AppUpdateManager
import com.google.android.play.core.appupdate.AppUpdateManagerFactory
import com.google.android.play.core.appupdate.AppUpdateOptions
import com.google.android.play.core.install.InstallStateUpdatedListener
import com.google.android.play.core.install.model.ActivityResult
import com.google.android.play.core.install.model.AppUpdateType
import com.google.android.play.core.install.model.InstallStatus
import com.google.android.play.core.install.model.UpdateAvailability
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

private const val UPDATE_REQUEST_CODE = 7341
private const val INSTALL_STATUS_EVENT = "onInstallStatusChange"

/**
 * Google Play in-app updates (flexible and immediate). The flexible flow never
 * installs on its own: JS decides when to call completeUpdate().
 */
class AppUpdateModule : Module() {
  private var appUpdateManager: AppUpdateManager? = null
  private var pendingStartPromise: Promise? = null

  private val installStateListener = InstallStateUpdatedListener { state ->
    sendEvent(INSTALL_STATUS_EVENT, mapOf("status" to installStatusName(state.installStatus())))
  }

  private fun manager(): AppUpdateManager {
    appUpdateManager?.let { return it }
    val context = appContext.reactContext ?: throw CodedException("React context is not available")
    return AppUpdateManagerFactory.create(context).also {
      it.registerListener(installStateListener)
      appUpdateManager = it
    }
  }

  override fun definition() = ModuleDefinition {
    Name("AppUpdate")

    Events(INSTALL_STATUS_EVENT)

    OnDestroy {
      appUpdateManager?.unregisterListener(installStateListener)
      appUpdateManager = null
    }

    AsyncFunction("getUpdateInfo") { promise: Promise ->
      manager().appUpdateInfo
        .addOnSuccessListener { info -> promise.resolve(serialize(info)) }
        .addOnFailureListener { error ->
          promise.reject(CodedException("Failed to read update info: ${error.message}", error))
        }
    }

    AsyncFunction("startUpdate") { type: String, promise: Promise ->
      if (pendingStartPromise != null) {
        promise.reject(CodedException("An update flow is already in progress"))
        return@AsyncFunction
      }
      // Reserved before the Play info lookup so a second call can't start alongside this one.
      // Every path that won't produce an activity result releases it.
      pendingStartPromise = promise
      fun release(settle: () -> Unit) {
        pendingStartPromise = null
        settle()
      }
      val updateType = if (type == "immediate") AppUpdateType.IMMEDIATE else AppUpdateType.FLEXIBLE
      val updateManager = try {
        manager()
      } catch (error: Exception) {
        release { promise.reject(CodedException("Failed to read update info: ${error.message}", error)) }
        return@AsyncFunction
      }

      updateManager.appUpdateInfo
        .addOnSuccessListener { info ->
          // An immediate update already in progress is resumed without re-checking whether it is allowed.
          val canStart = when (info.updateAvailability()) {
            UpdateAvailability.UPDATE_AVAILABLE -> info.isUpdateTypeAllowed(updateType)
            UpdateAvailability.DEVELOPER_TRIGGERED_UPDATE_IN_PROGRESS -> updateType == AppUpdateType.IMMEDIATE
            else -> false
          }
          if (!canStart) {
            release { promise.resolve("not_allowed") }
            return@addOnSuccessListener
          }
          val activity = appContext.currentActivity
          if (activity == null) {
            release { promise.reject(CodedException("Current activity is not available")) }
            return@addOnSuccessListener
          }
          try {
            val options = AppUpdateOptions.newBuilder(updateType).build()
            // false means Play didn't start the flow, so no activity result will arrive.
            if (!updateManager.startUpdateFlowForResult(info, activity, options, UPDATE_REQUEST_CODE)) {
              release { promise.resolve("not_allowed") }
            }
          } catch (error: Exception) {
            release { promise.reject(CodedException("Failed to start update flow: ${error.message}", error)) }
          }
        }
        .addOnFailureListener { error ->
          release { promise.reject(CodedException("Failed to read update info: ${error.message}", error)) }
        }
    }

    AsyncFunction("completeUpdate") { promise: Promise ->
      manager().completeUpdate()
        .addOnSuccessListener { promise.resolve(null) }
        .addOnFailureListener { error ->
          promise.reject(CodedException("Failed to complete update: ${error.message}", error))
        }
    }

    OnActivityResult { _, payload ->
      if (payload.requestCode != UPDATE_REQUEST_CODE) {
        return@OnActivityResult
      }
      val promise = pendingStartPromise ?: return@OnActivityResult
      pendingStartPromise = null
      val result = when (payload.resultCode) {
        Activity.RESULT_OK -> "accepted"
        Activity.RESULT_CANCELED -> "declined"
        ActivityResult.RESULT_IN_APP_UPDATE_FAILED -> "failed"
        else -> "failed"
      }
      promise.resolve(result)
    }
  }

  private fun serialize(info: AppUpdateInfo): Map<String, Any?> = mapOf(
    "updateAvailability" to when (info.updateAvailability()) {
      UpdateAvailability.UPDATE_AVAILABLE -> "available"
      UpdateAvailability.UPDATE_NOT_AVAILABLE -> "not_available"
      UpdateAvailability.DEVELOPER_TRIGGERED_UPDATE_IN_PROGRESS -> "in_progress"
      else -> "unknown"
    },
    "installStatus" to installStatusName(info.installStatus()),
    "flexibleAllowed" to info.isUpdateTypeAllowed(AppUpdateType.FLEXIBLE),
    "immediateAllowed" to info.isUpdateTypeAllowed(AppUpdateType.IMMEDIATE),
    "availableVersionCode" to info.availableVersionCode()
  )

  private fun installStatusName(status: Int): String = when (status) {
    InstallStatus.PENDING -> "pending"
    InstallStatus.DOWNLOADING -> "downloading"
    InstallStatus.DOWNLOADED -> "downloaded"
    InstallStatus.INSTALLING -> "installing"
    InstallStatus.INSTALLED -> "installed"
    InstallStatus.FAILED -> "failed"
    InstallStatus.CANCELED -> "canceled"
    else -> "unknown"
  }
}
