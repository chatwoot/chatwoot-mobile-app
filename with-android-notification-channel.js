const { withMainApplication, createRunOncePlugin } = require('@expo/config-plugins');

const CHANNEL_ID = 'default';
const CHANNEL_NAME = 'Default';
const MARKER = 'CW-3883 default notification channel';

// The manifest meta-data pointing FCM at this channel comes from the
// `messaging_android_notification_channel_id` key in firebase.json, which
// @react-native-firebase reads into its own manifest entry.

// notifee is not autolinked on Android, so create the channel with the platform API.
// A high-importance channel with vibration enabled plays the default notification sound and
// vibrates (Android 8+ ties both to the channel; vibration is off unless enabled explicitly).
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
      notificationChannel.enableVibration(true)
      getSystemService(android.app.NotificationManager::class.java)?.createNotificationChannel(notificationChannel)
    }`;
    cfg.modResults.contents = cfg.modResults.contents.replace(anchor, channelCode);
    return cfg;
  });
}

function withAndroidNotificationChannel(config) {
  return withChannelCreation(config);
}

module.exports = createRunOncePlugin(
  withAndroidNotificationChannel,
  'with-android-notification-channel',
  '1.0.0',
);
