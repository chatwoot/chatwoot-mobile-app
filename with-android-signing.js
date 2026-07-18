// [conomni] m6: релизная подпись Android.
//
// Каталог android/ генерируется prebuild'ом (CNG) и лежит в .gitignore — правки в
// android/app/build.gradle руками теряются при каждом `pnpm generate --clean`. Поэтому
// signingConfig внедряется конфиг-плагином, как это уже сделано для iOS-подов
// (with-ffmpeg-pod.js).
//
// Значения НЕ хранятся в репозитории: плагин ссылается на gradle-свойства
// CONOMNI_UPLOAD_STORE_FILE / _KEY_ALIAS / _STORE_PASSWORD / _KEY_PASSWORD, которые лежат
// в ~/.gradle/gradle.properties (chmod 600) на машине сборки; сам keystore и пароли —
// в Bitwarden «ConOmni Android keystore».
//
// Если свойств нет (чужая машина, CI без секретов) — release остаётся на debug-ключе,
// как в стоке: сборка не падает, но такой APK не поставится поверх релизного и не пройдёт
// проверку App Links. Смотреть на предупреждение в логе gradle.
const { withAppBuildGradle, createRunOncePlugin } = require('@expo/config-plugins');

const RELEASE_SIGNING_CONFIG = `        release {
            if (project.hasProperty('CONOMNI_UPLOAD_STORE_FILE')) {
                storeFile file(CONOMNI_UPLOAD_STORE_FILE)
                storePassword CONOMNI_UPLOAD_STORE_PASSWORD
                keyAlias CONOMNI_UPLOAD_KEY_ALIAS
                keyPassword CONOMNI_UPLOAD_KEY_PASSWORD
            } else {
                logger.warn('[conomni] CONOMNI_UPLOAD_* не заданы в gradle.properties — release будет подписан DEBUG-ключом')
                storeFile file('debug.keystore')
                storePassword 'android'
                keyAlias 'androiddebugkey'
                keyPassword 'android'
            }
        }
`;

// Комментарий про «generate your own keystore» стоит только в buildTypes.release —
// по нему и отличаем нужное вхождение `signingConfig signingConfigs.debug` от debug-сборки.
const RELEASE_MARKER =
  /\/\/ Caution! In production, you need to generate your own keystore file\.\s*\n\s*\/\/ see https:\/\/reactnative\.dev\/docs\/signed-apk-android\.\s*\n\s*signingConfig signingConfigs\.debug/;

function withAndroidSigning(config) {
  return withAppBuildGradle(config, cfg => {
    if (cfg.modResults.language !== 'groovy') {
      throw new Error('[conomni] with-android-signing: ожидался groovy build.gradle');
    }
    let contents = cfg.modResults.contents;

    if (!contents.includes('CONOMNI_UPLOAD_STORE_FILE')) {
      const before = contents;
      contents = contents.replace(
        /(signingConfigs \{\n)/,
        `$1${RELEASE_SIGNING_CONFIG}`,
      );
      if (contents === before) {
        throw new Error('[conomni] with-android-signing: не найден блок signingConfigs');
      }
    }

    if (RELEASE_MARKER.test(contents)) {
      contents = contents.replace(RELEASE_MARKER, 'signingConfig signingConfigs.release');
    } else if (!contents.includes('signingConfig signingConfigs.release')) {
      throw new Error(
        '[conomni] with-android-signing: не найден release-signingConfig апстрима — ' +
          'шаблон build.gradle изменился, проверить плагин после апгрейда Expo',
      );
    }

    cfg.modResults.contents = contents;
    return cfg;
  });
}

module.exports = createRunOncePlugin(withAndroidSigning, 'with-android-signing', '1.0.0');
