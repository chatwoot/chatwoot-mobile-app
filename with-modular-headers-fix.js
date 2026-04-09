const { withPlugins, createRunOncePlugin, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Config plugin to fix non-modular header issues when using `useFrameworks: 'static'`
 * with packages like @react-native-firebase that import React headers.
 *
 * Disables DEFINES_MODULE for firebase pods so they are not treated as Clang modules,
 * avoiding the "must be imported from module" errors.
 */
function addModularHeadersFix(podfilePath) {
  const fixSnippet = `
    # Fix non-modular header issues with Firebase + static frameworks
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'
        if target.name.start_with?('RNFB')
          config.build_settings['DEFINES_MODULE'] = 'NO'
        end
      end
    end`;

  let contents = fs.readFileSync(podfilePath, 'utf8');
  if (!contents.includes('CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES')) {
    contents = contents.replace(
      /post_install do \|installer\|/,
      `post_install do |installer|${fixSnippet}`,
    );
  }
  fs.writeFileSync(podfilePath, contents, 'utf8');
}

function withModularHeadersFix(config) {
  return withDangerousMod(config, [
    'ios',
    cfg => {
      const podfilePath = path.join(cfg.modRequest.platformProjectRoot, 'Podfile');
      addModularHeadersFix(podfilePath);
      return cfg;
    },
  ]);
}

const withPlugin = config => {
  return withPlugins(config, [withModularHeadersFix]);
};

module.exports = createRunOncePlugin(withPlugin, 'with-modular-headers-fix', '1.0.0');
