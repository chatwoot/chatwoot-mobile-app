const { createRunOncePlugin, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

// @react-native-firebase pulls in Firebase Swift pods (e.g. FirebaseCoreInternal)
// that depend on Objective-C pods which don't define clang modules (GoogleUtilities).
// Without `use_frameworks!`, CocoaPods can't integrate those Swift pods as static
// libraries unless the ObjC dependency exposes a module map. The standard, minimal
// fix is to opt that pod into modular headers (rather than enabling use_frameworks!,
// which on RN 0.81 New Arch breaks against the precompiled React-Core, or
// use_modular_headers! globally, which can disturb the React/Expo pods).
const MARKER = 'with-ios-modular-headers';

// Pods that Firebase's Swift pods import but which ship without module maps.
const MODULAR_PODS = ['GoogleUtilities'];

function patchPodfile(podfilePath) {
  let contents = fs.readFileSync(podfilePath, 'utf8');
  if (contents.includes(MARKER)) return;

  // Insert the modular-header pod declarations right after the target's
  // `use_native_modules!` call, before `use_react_native!`.
  const anchor = 'config = use_native_modules!(config_command)\n';
  const idx = contents.indexOf(anchor);
  if (idx === -1) {
    throw new Error(`${MARKER}: could not find use_native_modules! anchor in Podfile`);
  }
  const snippet =
    `\n  # ${MARKER}: let Firebase's Swift pods link statically without use_frameworks!\n` +
    MODULAR_PODS.map(name => `  pod '${name}', :modular_headers => true\n`).join('');
  const insertAt = idx + anchor.length;
  contents = contents.slice(0, insertAt) + snippet + contents.slice(insertAt);
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

module.exports = createRunOncePlugin(withIosModularHeaders, MARKER, '2.0.0');
