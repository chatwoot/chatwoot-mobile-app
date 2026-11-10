const { createRunOncePlugin, withAppDelegate, withInfoPlist } = require('@expo/config-plugins');

const MARKER = 'with-ios-scene-lifecycle';

const WINDOW_LINE = /\n[ \t]*window = UIWindow\(frame: UIScreen\.main\.bounds\)/;
const START_CALL =
  /\n[ \t]*factory\.startReactNative\(\s*withModuleName: "([^"]+)",\s*in: window,\s*launchOptions: launchOptions\)/;

const sceneDelegate = moduleName => `
// @generated ${MARKER}
class SceneDelegate: UIResponder, UIWindowSceneDelegate {
  var window: UIWindow?

  func scene(
    _ scene: UIScene,
    willConnectTo session: UISceneSession,
    options connectionOptions: UIScene.ConnectionOptions
  ) {
    guard
      let windowScene = scene as? UIWindowScene,
      let appDelegate = UIApplication.shared.delegate as? AppDelegate,
      let factory = appDelegate.reactNativeFactory
    else { return }

    let window = UIWindow(windowScene: windowScene)
    self.window = window
    appDelegate.window = window

    var launchOptions: [UIApplication.LaunchOptionsKey: Any] = [:]
    if let url = connectionOptions.urlContexts.first?.url {
      launchOptions[.url] = url
    }
    if let userActivity = connectionOptions.userActivities.first {
      launchOptions[.userActivityDictionary] = [
        "UIApplicationLaunchOptionsUserActivityKey": userActivity,
        UIApplication.LaunchOptionsKey.userActivityType: userActivity.activityType,
      ]
    }

    factory.startReactNative(withModuleName: "${moduleName}", in: window, launchOptions: launchOptions)
  }

  func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
    guard let context = URLContexts.first else { return }
    var options: [UIApplication.OpenURLOptionsKey: Any] = [:]
    if let sourceApplication = context.options.sourceApplication {
      options[.sourceApplication] = sourceApplication
    }
    _ = UIApplication.shared.delegate?.application?(UIApplication.shared, open: context.url, options: options)
  }

  func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
    _ = UIApplication.shared.delegate?.application?(UIApplication.shared, continue: userActivity) { _ in }
  }
}
`;

function moveStartToScene(contents) {
  if (contents.includes(`@generated ${MARKER}`)) {
    return contents;
  }
  const start = contents.match(START_CALL);
  if (!start || !WINDOW_LINE.test(contents)) {
    throw new Error(`${MARKER}: AppDelegate.swift does not match the expected template`);
  }
  return contents.replace(WINDOW_LINE, '').replace(START_CALL, '') + sceneDelegate(start[1]);
}

const withSceneDelegate = config =>
  withAppDelegate(config, cfg => {
    if (cfg.modResults.language !== 'swift') {
      throw new Error(`${MARKER}: expected a Swift AppDelegate`);
    }
    cfg.modResults.contents = moveStartToScene(cfg.modResults.contents);
    return cfg;
  });

const withSceneManifest = config =>
  withInfoPlist(config, cfg => {
    cfg.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [
          {
            UISceneConfigurationName: 'Default Configuration',
            UISceneDelegateClassName: '$(PRODUCT_MODULE_NAME).SceneDelegate',
          },
        ],
      },
    };
    return cfg;
  });

const withIosSceneLifecycle = config => withSceneManifest(withSceneDelegate(config));

module.exports = createRunOncePlugin(withIosSceneLifecycle, MARKER, '1.0.0');
