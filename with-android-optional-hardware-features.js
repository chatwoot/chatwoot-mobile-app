const { withAndroidManifest, createRunOncePlugin } = require('@expo/config-plugins');

// Android implies these from the portrait lock and ACCESS_WIFI_STATE and marks
// them required, which hides the app from devices without them on Google Play.
const OPTIONAL_FEATURES = ['android.hardware.screen.portrait', 'android.hardware.wifi'];

function withAndroidOptionalHardwareFeatures(config) {
  return withAndroidManifest(config, cfg => {
    const manifest = cfg.modResults.manifest;
    const features = manifest['uses-feature'] || [];

    OPTIONAL_FEATURES.forEach(name => {
      const existing = features.find(feature => feature.$['android:name'] === name);
      if (existing) {
        existing.$['android:required'] = 'false';
      } else {
        features.push({ $: { 'android:name': name, 'android:required': 'false' } });
      }
    });

    manifest['uses-feature'] = features;
    return cfg;
  });
}

module.exports = createRunOncePlugin(
  withAndroidOptionalHardwareFeatures,
  'with-android-optional-hardware-features',
  '1.0.0',
);
