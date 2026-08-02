// [conomni] m9: Android-уведомления — свой канал по умолчанию для FCM + монохромная
// иконка + акцентный цвет бренда.
//
// Диагноз с живого устройства (Redmi 9A, Android 10):
// - без `com.google.firebase.messaging.default_notification_channel_id` в манифесте FCM SDK
//   логирует `Missing Default Notification Channel metadata` и рисует уведомление в канале
//   `fcm_fallback_notification_channel` — MIUI считает такой канал неважным
//   (`No peeking: unimportant notification`): пуш не всплывает и приходит без звука. Сам
//   канал (importance/sound/vibration) создаётся JS-стороной идемпотентно через notifee
//   (см. src/utils/pushUtils.ts, ensureAndroidNotificationChannel) — id должен совпадать
//   с ANDROID_NOTIFICATION_CHANNEL_ID оттуда.
// - без `default_notification_icon`/`default_notification_color` уведомление рисуется
//   квадратной цветной иконкой приложения, которую Android превращает в серый квадрат —
//   нужен монохромный (белый на прозрачном) drawable-ресурс + акцентный цвет отдельно.
//
// Каталог android/ генерируется prebuild'ом (CNG) и в .gitignore — правки в манифест
// руками теряются при каждом `pnpm generate --clean`, поэтому и meta-data, и растровые
// ресурсы иконки вносятся конфиг-плагином, как это уже сделано для release-подписи
// (with-android-signing.js) и iOS-подов (with-ffmpeg-pod.js).
const {
  withAndroidManifest,
  withAndroidColors,
  withDangerousMod,
  createRunOncePlugin,
  AndroidConfig,
} = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

// Должен совпадать с ANDROID_NOTIFICATION_CHANNEL_ID в src/utils/pushUtils.ts.
const NOTIFICATION_CHANNEL_ID = 'conomni_messages';
const NOTIFICATION_COLOR_NAME = 'conomni_notification_color';
// Бренд-цвет ConOmni V2 «Теал» (см. PATCHES.md, m2).
const NOTIFICATION_COLOR_VALUE = '#12A594';

// Готовые растровые иконки на все плотности лежат рядом в android-notification-icon/
// (сгенерированы из assets/notification-icon.svg через rsvg-convert — см. комментарий там же).
const ICON_SOURCE_DIR = path.join(__dirname, 'android-notification-icon');
const ICON_FILENAME = 'ic_notification.png';

function withNotificationManifestMetadata(config) {
  return withAndroidManifest(config, cfg => {
    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(cfg.modResults);
    AndroidConfig.Manifest.addMetaDataItemToMainApplication(
      mainApplication,
      'com.google.firebase.messaging.default_notification_channel_id',
      NOTIFICATION_CHANNEL_ID,
      'value',
    );
    AndroidConfig.Manifest.addMetaDataItemToMainApplication(
      mainApplication,
      'com.google.firebase.messaging.default_notification_icon',
      '@drawable/ic_notification',
      'resource',
    );
    AndroidConfig.Manifest.addMetaDataItemToMainApplication(
      mainApplication,
      'com.google.firebase.messaging.default_notification_color',
      `@color/${NOTIFICATION_COLOR_NAME}`,
      'resource',
    );
    return cfg;
  });
}

function withNotificationColor(config) {
  return withAndroidColors(config, cfg => {
    cfg.modResults = AndroidConfig.Colors.assignColorValue(cfg.modResults, {
      name: NOTIFICATION_COLOR_NAME,
      value: NOTIFICATION_COLOR_VALUE,
    });
    return cfg;
  });
}

function withNotificationIcon(config) {
  return withDangerousMod(config, [
    'android',
    cfg => {
      const resDir = path.join(cfg.modRequest.platformProjectRoot, 'app/src/main/res');
      for (const dirName of fs.readdirSync(ICON_SOURCE_DIR)) {
        const srcFile = path.join(ICON_SOURCE_DIR, dirName, ICON_FILENAME);
        if (!fs.existsSync(srcFile)) {
          continue;
        }
        const destDir = path.join(resDir, dirName);
        fs.mkdirSync(destDir, { recursive: true });
        fs.copyFileSync(srcFile, path.join(destDir, ICON_FILENAME));
      }
      return cfg;
    },
  ]);
}

function withAndroidNotifications(config) {
  config = withNotificationManifestMetadata(config);
  config = withNotificationColor(config);
  config = withNotificationIcon(config);
  return config;
}

module.exports = createRunOncePlugin(withAndroidNotifications, 'with-android-notifications', '1.0.0');
