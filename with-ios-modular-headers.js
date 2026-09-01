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

// firebase-ios-sdk's Swift Package products are automatic libraries, so each
// @react-native-firebase pod resolving Firebase through SPM embeds its own copy, and
// those copies collide as duplicate symbols under static linkage. Opting out keeps
// Firebase on CocoaPods.
const SPM_OPT_OUT = '$RNFirebaseDisableSPM = true';

// Pods that Firebase's Swift pods import but which ship without module maps.
const MODULAR_PODS = ['GoogleUtilities'];

function patchPodfile(podfilePath) {
  let contents = fs.readFileSync(podfilePath, 'utf8');

  // Must sit at the top level, before any target block.
  if (!contents.includes(SPM_OPT_OUT)) {
    const targetIdx = contents.indexOf("\ntarget '");
    if (targetIdx === -1) {
      throw new Error(`${MARKER}: could not find a target block in Podfile`);
    }
    contents =
      contents.slice(0, targetIdx) +
      `\n\n# ${MARKER}: keep Firebase on CocoaPods so it links statically\n${SPM_OPT_OUT}\n` +
      contents.slice(targetIdx);
    fs.writeFileSync(podfilePath, contents, 'utf8');
  }

  // Guard on the emitted pod line: both snippets carry the marker in a comment.
  if (MODULAR_PODS.every(name => contents.includes(`pod '${name}', :modular_headers => true`))) {
    return;
  }

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
