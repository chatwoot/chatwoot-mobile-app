import ExpoModulesCore
import StoreKit

/**
 Presents the app's App Store page in-app. The promise resolves once the store
 sheet is on screen and rejects if the product page can't be loaded.
 */
public class AppUpdateModule: Module {
  private let storeDelegate = StoreProductDelegate()

  public func definition() -> ModuleDefinition {
    Name("AppUpdate")

    AsyncFunction("presentStorePage") { (appStoreId: String, promise: Promise) in
      guard let presenter = self.appContext?.utilities?.currentViewController() else {
        promise.reject("ERR_NO_VIEW_CONTROLLER", "No view controller to present the App Store page from")
        return
      }

      let storeController = SKStoreProductViewController()
      storeController.delegate = self.storeDelegate
      let parameters = [SKStoreProductParameterITunesItemIdentifier: appStoreId]

      storeController.loadProduct(withParameters: parameters) { loaded, error in
        DispatchQueue.main.async {
          guard loaded else {
            promise.reject("ERR_STORE_LOAD", error?.localizedDescription ?? "Could not load the App Store page")
            return
          }
          presenter.present(storeController, animated: true) {
            promise.resolve(nil)
          }
        }
      }
    }
    .runOnQueue(.main)
  }
}

private class StoreProductDelegate: NSObject, SKStoreProductViewControllerDelegate {
  func productViewControllerDidFinish(_ viewController: SKStoreProductViewController) {
    viewController.dismiss(animated: true)
  }
}
