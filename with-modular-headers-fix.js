const { withDangerousMod, createRunOncePlugin } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Config plugin for iOS Firebase + ExpoModulesCore + `useFrameworks: 'static'` compatibility.
 *
 * Two changes to the generated Podfile:
 *  1. `use_modular_headers!` — required so Firebase's Swift pods can see Objective-C
 *     dependencies (GoogleUtilities) as modules.
 *  2. `CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES = YES` applied to every pod
 *     target via post_install — required so Firebase framework modules can include
 *     non-modular React-Core public headers.
 */
function patchPodfile(podfilePath) {
  let contents = fs.readFileSync(podfilePath, 'utf8');

  if (!contents.includes('use_modular_headers!')) {
    contents = contents.replace(
      /(\s*use_expo_modules!)/,
      `\n  use_modular_headers!$1`,
    );
  }

  if (!contents.includes('CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES')) {
    const snippet = `
    # Allow non-modular React headers inside framework modules.
    # Also disable DEFINES_MODULE for RNFB pods so Clang doesn't treat their
    # React-bridged types (e.g. RCTPromiseRejectBlock) as owned by RNFB's submodule,
    # which otherwise triggers "must be imported from module" errors in consumers.
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'
        if target.name.start_with?('RNFB')
          config.build_settings['DEFINES_MODULE'] = 'NO'
        end
      end
    end`;
    contents = contents.replace(
      /post_install do \|installer\|/,
      `post_install do |installer|${snippet}`,
    );
  }

  fs.writeFileSync(podfilePath, contents, 'utf8');
}

function withModularHeadersFix(config) {
  return withDangerousMod(config, [
    'ios',
    cfg => {
      const podfilePath = path.join(cfg.modRequest.platformProjectRoot, 'Podfile');
      patchPodfile(podfilePath);
      return cfg;
    },
  ]);
}

module.exports = createRunOncePlugin(withModularHeadersFix, 'with-modular-headers-fix', '1.0.0');
