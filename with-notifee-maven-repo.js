const { createRunOncePlugin, withProjectBuildGradle } = require('@expo/config-plugins');

// Notifee does not publish `app.notifee:core` to any remote Maven repo. It ships the
// .aar as a *local* Maven repo inside node_modules and injects that path from its own
// build.gradle via `rootProject.allprojects { repositories { ... } }`. Under newer Gradle
// (8.14+) with `--configure-on-demand` (which `expo run:android` passes), that injection
// can lose the race against `:app` resolving its classpath, causing:
//   "Could not find any matches for app.notifee:core:+"
// We make the repo unconditionally available by declaring it on the root project,
// resolving the package path with node so it survives pnpm/monorepo hoisting.
const MARKER = 'with-notifee-maven-repo';

const REPO_BLOCK = `
// >>> ${MARKER}: ensure notifee's bundled local maven repo is always on the root
// repositories list, independent of project configuration order (configure-on-demand).
allprojects {
  repositories {
    maven {
      url(new File(
        providers.exec {
          commandLine("node", "--print", "require('path').dirname(require.resolve('@notifee/react-native/package.json'))")
        }.standardOutput.asText.get().trim(),
        "android/libs"
      ))
    }
  }
}
// <<< ${MARKER}
`;

const withNotifeeMavenRepo = config =>
  withProjectBuildGradle(config, cfg => {
    if (cfg.modResults.language !== 'groovy') {
      throw new Error(`${MARKER}: cannot patch non-groovy root build.gradle`);
    }
    if (!cfg.modResults.contents.includes(MARKER)) {
      cfg.modResults.contents += REPO_BLOCK;
    }
    return cfg;
  });

module.exports = createRunOncePlugin(withNotifeeMavenRepo, MARKER, '1.0.0');
