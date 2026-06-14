const { withAndroidManifest, createRunOncePlugin } = require('@expo/config-plugins');

// Keep in sync with ANDROID_DEFAULT_CHANNEL_ID in src/utils/pushUtils.ts.
const DEFAULT_CHANNEL_ID = 'default';

// Firebase Cloud Messaging displays incoming notifications on the channel named by
// this manifest meta-data. Without it, FCM falls back to an auto-generated
// "Miscellaneous" channel that the app never registers, so custom sound / Do Not
// Disturb settings made against our own channel have no effect. Pointing FCM at the
// channel we create on startup makes those per-channel settings actually apply.
const META_DATA_NAME = 'com.google.firebase.messaging.default_notification_channel_id';

function setDefaultNotificationChannel(androidManifest) {
  const application = androidManifest.manifest.application?.[0];
  if (!application) {
    return androidManifest;
  }

  application['meta-data'] = application['meta-data'] || [];

  const existing = application['meta-data'].find(
    item => item.$?.['android:name'] === META_DATA_NAME,
  );

  if (existing) {
    existing.$['android:value'] = DEFAULT_CHANNEL_ID;
  } else {
    application['meta-data'].push({
      $: {
        'android:name': META_DATA_NAME,
        'android:value': DEFAULT_CHANNEL_ID,
      },
    });
  }

  return androidManifest;
}

const withAndroidNotificationChannel = config => {
  return withAndroidManifest(config, cfg => {
    cfg.modResults = setDefaultNotificationChannel(cfg.modResults);
    return cfg;
  });
};

module.exports = createRunOncePlugin(
  withAndroidNotificationChannel,
  'with-android-notification-channel',
  '1.0.0',
);
