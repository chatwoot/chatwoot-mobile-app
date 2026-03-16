const { withPlugins, createRunOncePlugin, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Config plugin to add FirebaseApp.configure() to AppDelegate.swift.
 * This is needed because the @react-native-firebase/app plugin cannot
 * automatically determine the insertion point in Expo SDK 55's AppDelegate.
 */
function addFirebaseConfigure(appDelegatePath) {
  let contents = fs.readFileSync(appDelegatePath, 'utf8');

  if (contents.includes('FirebaseApp.configure()')) {
    return;
  }

  // Insert FirebaseApp.configure() at the beginning of didFinishLaunchingWithOptions
  contents = contents.replace(
    /didFinishLaunchingWithOptions launchOptions: \[UIApplication\.LaunchOptionsKey: Any\]\? = nil\n  \) -> Bool \{/,
    `didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil\n  ) -> Bool {\n    FirebaseApp.configure()`,
  );

  fs.writeFileSync(appDelegatePath, contents, 'utf8');
}

function withFirebaseAppDelegate(config) {
  return withDangerousMod(config, [
    'ios',
    cfg => {
      const appDelegatePath = path.join(
        cfg.modRequest.platformProjectRoot,
        cfg.modRequest.projectName || 'Chatwoot',
        'AppDelegate.swift',
      );
      if (fs.existsSync(appDelegatePath)) {
        addFirebaseConfigure(appDelegatePath);
      }
      return cfg;
    },
  ]);
}

const withPlugin = config => {
  return withPlugins(config, [withFirebaseAppDelegate]);
};

module.exports = createRunOncePlugin(withPlugin, 'with-firebase-appdelegate', '1.0.0');
