const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

function withNotifeeMaven(config) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const buildGradlePath = path.join(
        config.modRequest.projectRoot,
        'android',
        'build.gradle'
      );

      if (fs.existsSync(buildGradlePath)) {
        console.log('🔧 Adding Notifee Maven repository...');
        let content = fs.readFileSync(buildGradlePath, 'utf8');
        
        // Check if the Notifee Maven repository is already added
        const notifeeMavenRepo = `maven { url new File(['node', '--print', "require.resolve('@notifee/react-native/package.json')"].execute(null, rootDir).text.trim(), '../android/libs') }`;
        
        if (!content.includes('@notifee/react-native/package.json')) {
          // Find the allprojects repositories block and add the Notifee Maven repository
          // Look for the jitpack.io maven repository and add after it
          const jitpackMavenRegex = /(maven\s*\{\s*url\s*'https:\/\/www\.jitpack\.io'\s*\})/;
          
          if (jitpackMavenRegex.test(content)) {
            content = content.replace(
              jitpackMavenRegex,
              `$1\n        ${notifeeMavenRepo}`
            );
            console.log('  ✅ Added Notifee Maven repository to allprojects');
          } else {
            console.log('  ⚠️  Could not find jitpack.io maven repository to add after');
          }
          
          fs.writeFileSync(buildGradlePath, content);
        } else {
          console.log('  ✅ Notifee Maven repository already exists');
        }
      }
      
      return config;
    },
  ]);
}

module.exports = withNotifeeMaven;
