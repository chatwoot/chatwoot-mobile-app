const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Expo config plugin to fix Android build.gradle after expo prebuild
 * This ensures necessary configurations persist across prebuild runs
 * 
 * Fixes:
 * 1. Adds gradlePluginPortal() to buildscript repositories
 * 2. Uses kotlinVersion variable in Kotlin Gradle plugin classpath
 * 3. Adds Notifee local maven repository for notifee:core library
 */
function withAndroidGradleFixes(config) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const buildGradlePath = path.join(
        config.modRequest.projectRoot,
        'android',
        'build.gradle'
      );

      if (fs.existsSync(buildGradlePath)) {
        console.log('🔧 Applying Android build.gradle fixes...');

        let content = fs.readFileSync(buildGradlePath, 'utf8');
        let modified = false;

        // Fix 1: Add gradlePluginPortal() if not present
        if (!content.includes('gradlePluginPortal()')) {
          content = content.replace(
            /(repositories\s*\{\s*\n\s*google\(\)\s*\n\s*mavenCentral\(\))/,
            '$1\n        gradlePluginPortal()'
          );
          console.log('  ✅ Added gradlePluginPortal()');
          modified = true;
        }

        // Fix 2: Use kotlinVersion variable in classpath if not already
        if (content.includes("classpath('org.jetbrains.kotlin:kotlin-gradle-plugin')") &&
            !content.includes('classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:${kotlinVersion}")')) {
          content = content.replace(
            /classpath\('org\.jetbrains\.kotlin:kotlin-gradle-plugin'\)/,
            'classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:${kotlinVersion}")'
          );
          console.log('  ✅ Updated Kotlin Gradle plugin to use kotlinVersion variable');
          modified = true;
        }

        // Fix 3: Add Notifee local maven repository if not present
        // This is needed for app.notifee:core library
        if (!content.includes('@notifee/react-native')) {
          const notifeeRepo = `        maven {
            // Notifee local maven repository for notifee:core
            url(new File(['node', '--print', "require.resolve('@notifee/react-native/package.json')"].execute(null, rootDir).text.trim(), '../android/libs'))
        }`;

          // Find the allprojects repositories block and add notifee repo after JSC
          content = content.replace(
            /(maven \{\s*\n\s*\/\/ Android JSC is installed from npm[\s\S]*?\n\s*\})/,
            `$1\n${notifeeRepo}`
          );
          console.log('  ✅ Added Notifee local maven repository');
          modified = true;
        }

        if (modified) {
          fs.writeFileSync(buildGradlePath, content, 'utf8');
          console.log('✅ Android build.gradle fixes applied successfully');
        } else {
          console.log('ℹ️  Android build.gradle already has all fixes');
        }
      } else {
        console.log('⚠️  build.gradle not found, skipping fixes');
      }

      return config;
    },
  ]);
}

module.exports = withAndroidGradleFixes;

