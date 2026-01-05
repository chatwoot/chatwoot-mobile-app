const { withProjectBuildGradle, createRunOncePlugin } = require('@expo/config-plugins');

function withNotifeeRepo(config) {
  return withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      config.modResults.contents = addNotifeeMavenRepo(config.modResults.contents);
    } else {
      throw new Error('Cannot add Notifee maven repo because build.gradle is not groovy');
    }
    return config;
  });
}

function addNotifeeMavenRepo(buildGradle) {
  const notifeeRepo = `        maven { url "$rootDir/../node_modules/@notifee/react-native/android/libs" }`;
  
  // Look for allprojects { repositories { ... } }
  if (buildGradle.includes(notifeeRepo)) {
    return buildGradle;
  }

  // Find the allprojects/repositories block and add the repo
  return buildGradle.replace(
    /allprojects\s*\{\s*repositories\s*\{/,
    `allprojects {
    repositories {
${notifeeRepo}`
  );
}

module.exports = createRunOncePlugin(withNotifeeRepo, 'with-notifee-repo', '1.0.0');
