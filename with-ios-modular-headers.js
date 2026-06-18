const { createRunOncePlugin, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

// Under `use_frameworks! :static` + New Architecture, pods are built as framework
// modules. Several libs (notably @react-native-firebase) textually #import non-modular
// React-Core headers (RCTConvert.h, RCTBridgeModule.h, ...), which clang rejects with
//   error: include of non-modular header inside framework module ... [-Werror,
//   -Wnon-modular-include-in-framework-module]
// Allowing non-modular includes in framework modules is the standard, safe fix for this
// RN + use_frameworks combination. We set it on every pod target in post_install.
const MARKER = 'with-ios-modular-headers';

const SNIPPET = `    # ${MARKER}: allow non-modular React-Core includes inside framework modules
    # (required by @react-native-firebase et al. under use_frameworks! + New Arch).
    installer.pods_project.targets.each do |__mod_target|
      __mod_target.build_configurations.each do |__mod_config|
        __mod_config.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'
      end
    end
`;

function patchPodfile(podfilePath) {
  let contents = fs.readFileSync(podfilePath, 'utf8');
  if (contents.includes(MARKER)) return;

  const anchor = 'post_install do |installer|\n';
  const idx = contents.indexOf(anchor);
  if (idx === -1) {
    throw new Error(`${MARKER}: could not find post_install block in Podfile`);
  }
  const insertAt = idx + anchor.length;
  contents = contents.slice(0, insertAt) + SNIPPET + contents.slice(insertAt);
  fs.writeFileSync(podfilePath, contents, 'utf8');
}

const withIosModularHeaders = config =>
  withDangerousMod(config, [
    'ios',
    cfg => {
      patchPodfile(path.join(cfg.modRequest.platformProjectRoot, 'Podfile'));
      return cfg;
    },
  ]);

module.exports = createRunOncePlugin(withIosModularHeaders, MARKER, '1.0.0');
