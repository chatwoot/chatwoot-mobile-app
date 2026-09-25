import ExpoModulesCore

// Registers for VoIP pushes as early as the app launches, so a push that starts the app
// is reported to CallKit before any JavaScript runs.
public class ChatwootCallsAppDelegateSubscriber: ExpoAppDelegateSubscriber {
  public func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    CallKitManager.shared.start()
    return false
  }
}
