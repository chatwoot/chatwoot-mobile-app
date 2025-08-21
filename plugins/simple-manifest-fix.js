const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Simple Expo plugin to fix Firebase notification color conflict
 * Only adds tools:replace if the specific conflict exists
 */
function withSimpleManifestFix(config) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const manifestPath = path.join(config.modRequest.projectRoot, 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
      
      if (fs.existsSync(manifestPath)) {
        console.log('🔧 Checking for Firebase notification color conflict...');
        
        let content = fs.readFileSync(manifestPath, 'utf8');
        
        // Only fix if we find the specific problematic line
        if (content.includes('com.google.firebase.messaging.default_notification_color') && 
            content.includes('@color/notification_icon_color') &&
            !content.includes('tools:replace="android:resource"')) {
          
          console.log('🎯 Found Firebase notification color conflict, applying simple fix...');
          
          // Add xmlns:tools if not present
          if (!content.includes('xmlns:tools')) {
            content = content.replace(
              '<manifest xmlns:android="http://schemas.android.com/apk/res/android"',
              '<manifest xmlns:android="http://schemas.android.com/apk/res/android" xmlns:tools="http://schemas.android.com/tools"'
            );
          }
          
          // Add tools:replace to the specific meta-data line
          content = content.replace(
            /(<meta-data[^>]*android:name="com\.google\.firebase\.messaging\.default_notification_color"[^>]*android:resource="@color\/notification_icon_color"[^>]*)(>|\/?>)/g,
            '$1 tools:replace="android:resource"$2'
          );
          
          fs.writeFileSync(manifestPath, content, 'utf8');
          console.log('✅ Applied simple manifest fix');
        } else {
          console.log('ℹ️  No Firebase notification color conflict found or already fixed');
        }
      }
      
      return config;
    },
  ]);
}

module.exports = withSimpleManifestFix;