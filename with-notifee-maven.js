const { withProjectBuildGradle, createRunOncePlugin } = require('@expo/config-plugins');

/**
 * Registers @notifee/react-native's local maven repository in the root android/build.gradle.
 *
 * Notifee publishes its Android artifact as a flat-file maven repo bundled under
 * node_modules/@notifee/react-native/android/libs. Its own build.gradle tries to register
 * the repo via `rootProject.allprojects { repositories { ... } }`, but that mutation runs
 * too late for :app dependency resolution on Gradle 9.
 *
 * We add the repo directly to the root allprojects { repositories { ... } } block so :app
 * can resolve `app.notifee:core:+`.
 */
const NOTIFEE_MAVEN_LINE =
  'maven { url "$rootDir/../node_modules/@notifee/react-native/android/libs" }';

function addNotifeeMaven(contents) {
  if (contents.includes('@notifee/react-native/android/libs')) {
    return contents;
  }
  return contents.replace(
    /allprojects\s*\{\s*\n\s*repositories\s*\{/,
    match => `${match}\n    ${NOTIFEE_MAVEN_LINE}`,
  );
}

function withNotifeeMaven(config) {
  return withProjectBuildGradle(config, cfg => {
    cfg.modResults.contents = addNotifeeMaven(cfg.modResults.contents);
    return cfg;
  });
}

module.exports = createRunOncePlugin(withNotifeeMaven, 'with-notifee-maven', '1.0.0');
