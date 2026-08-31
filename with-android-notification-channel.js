const {
  withAndroidManifest,
  withMainApplication,
  createRunOncePlugin,
} = require('@expo/config-plugins');

const CHANNEL_ID = 'default';
const CHANNEL_NAME = 'Default';
const META_NAME = 'com.google.firebase.messaging.default_notification_channel_id';
const MARKER = 'CW-3883 default notification channel';

// Points FCM at the channel below for backgrounded/killed notifications.
function withMetaData(config) {
  return withAndroidManifest(config, cfg => {
    const application = cfg.modResults.manifest.application?.[0];
    if (application) {
      application['meta-data'] = application['meta-data'] || [];
      const existing = application['meta-data'].find(
        item => item.$['android:name'] === META_NAME,
      );
      if (existing) {
        existing.$['android:value'] = CHANNEL_ID;
      } else {
        application['meta-data'].push({
          $: { 'android:name': META_NAME, 'android:value': CHANNEL_ID },
        });
      }
    }
    return cfg;
  });
}

// notifee is not autolinked on Android, so create the channel with the platform API.
// A high-importance channel plays the default notification sound (Android 8+ ties sound to the channel).
function withChannelCreation(config) {
  return withMainApplication(config, cfg => {
    if (cfg.modResults.language !== 'kt' || cfg.modResults.contents.includes(MARKER)) {
      return cfg;
    }
    const anchor = 'ApplicationLifecycleDispatcher.onApplicationCreate(this)';
    const channelCode = `${anchor}
    // ${MARKER}
    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
      val notificationChannel = android.app.NotificationChannel(
        "${CHANNEL_ID}",
        "${CHANNEL_NAME}",
        android.app.NotificationManager.IMPORTANCE_HIGH
      )
      getSystemService(android.app.NotificationManager::class.java)?.createNotificationChannel(notificationChannel)
    }`;
    cfg.modResults.contents = cfg.modResults.contents.replace(anchor, channelCode);
    return cfg;
  });
}

function withAndroidNotificationChannel(config) {
  return withChannelCreation(withMetaData(config));
}

module.exports = createRunOncePlugin(
  withAndroidNotificationChannel,
  'with-android-notification-channel',
  '1.0.0',
);
