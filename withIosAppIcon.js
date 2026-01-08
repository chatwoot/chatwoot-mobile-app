const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Config plugin to copy AppIcon.appiconset to iOS project
 * This ensures iOS uses the new blue rounded square icons
 */
const withIosAppIcon = (config) => {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const platformProjectRoot = config.modRequest.platformProjectRoot;
      
      console.log('[withIosAppIcon] Copying AppIcon.appiconset to iOS project...');
      
      // Source: assets/AppIcon.appiconset
      const sourceDir = path.join(projectRoot, 'assets', 'AppIcon.appiconset');
      
      // Destination: ios/AlooChat/Images.xcassets/AppIcon.appiconset
      const destDir = path.join(
        platformProjectRoot,
        'AlooChat',
        'Images.xcassets',
        'AppIcon.appiconset'
      );
      
      try {
        // Create destination directory
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }
        
        // Copy all files from source to destination
        const files = fs.readdirSync(sourceDir);
        
        for (const file of files) {
          const sourcePath = path.join(sourceDir, file);
          const destPath = path.join(destDir, file);
          
          if (fs.statSync(sourcePath).isFile()) {
            fs.copyFileSync(sourcePath, destPath);
            console.log(`[withIosAppIcon] ✓ Copied ${file}`);
          }
        }
        
        console.log('[withIosAppIcon] ✅ AppIcon.appiconset copied successfully');
      } catch (err) {
        console.error('[withIosAppIcon] ❌ Error copying AppIcon.appiconset:', err);
      }
      
      return config;
    },
  ]);
};

module.exports = withIosAppIcon;
