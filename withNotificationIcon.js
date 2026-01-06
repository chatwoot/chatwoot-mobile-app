const { withDangerousMod, withAndroidManifest } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

// Plugin to copy notification icon and colors from assets to Android res
const withNotificationIconCopy = (config) => {
    return withDangerousMod(config, [
        'android',
        async (config) => {
            const projectRoot = config.modRequest.projectRoot;
            const platformProjectRoot = config.modRequest.platformProjectRoot;
            
            console.log('[withNotificationIcon] ====== STARTING ======');
            console.log('[withNotificationIcon] projectRoot:', projectRoot);
            console.log('[withNotificationIcon] platformProjectRoot:', platformProjectRoot);
            
            // Copy notification icon
            const iconSourcePath = path.join(projectRoot, 'assets', 'ic_notification.xml');
            const drawableDir = path.join(platformProjectRoot, 'app', 'src', 'main', 'res', 'drawable');
            const iconDestPath = path.join(drawableDir, 'ic_notification.xml');

            try {
                if (fs.existsSync(iconSourcePath)) {
                    if (!fs.existsSync(drawableDir)) {
                        fs.mkdirSync(drawableDir, { recursive: true });
                    }
                    const contents = fs.readFileSync(iconSourcePath, 'utf-8');
                    fs.writeFileSync(iconDestPath, contents);
                    console.log('[withNotificationIcon] ✓ Copied ic_notification.xml to drawable');
                } else {
                    console.log('[withNotificationIcon] ✗ ic_notification.xml not found at:', iconSourcePath);
                }
            } catch (err) {
                console.error('[withNotificationIcon] Error copying icon:', err);
            }

            // Copy colors.xml from template
            const colorsSourcePath = path.join(projectRoot, 'assets', 'android', 'values', 'colors.xml');
            const valuesDir = path.join(platformProjectRoot, 'app', 'src', 'main', 'res', 'values');
            const colorsDestPath = path.join(valuesDir, 'colors.xml');

            try {
                console.log('[withNotificationIcon] Colors source:', colorsSourcePath);
                console.log('[withNotificationIcon] Colors dest:', colorsDestPath);
                console.log('[withNotificationIcon] Source exists:', fs.existsSync(colorsSourcePath));
                
                // Ensure values directory exists
                if (!fs.existsSync(valuesDir)) {
                    console.log('[withNotificationIcon] Creating values directory');
                    fs.mkdirSync(valuesDir, { recursive: true });
                }

                if (fs.existsSync(colorsSourcePath)) {
                    // Read template colors
                    const templateColors = fs.readFileSync(colorsSourcePath, 'utf-8');
                    
                    if (fs.existsSync(colorsDestPath)) {
                        // Merge with existing colors.xml
                        let existingColors = fs.readFileSync(colorsDestPath, 'utf-8');
                        console.log('[withNotificationIcon] Existing colors.xml found');
                        
                        if (!existingColors.includes('notification_icon_color')) {
                            existingColors = existingColors.replace(
                                '</resources>',
                                '    <color name="notification_icon_color">#1F93FF</color>\n</resources>'
                            );
                            fs.writeFileSync(colorsDestPath, existingColors);
                            console.log('[withNotificationIcon] ✓ Added notification_icon_color to existing colors.xml');
                        } else {
                            console.log('[withNotificationIcon] ✓ notification_icon_color already exists');
                        }
                    } else {
                        // Copy template directly
                        fs.writeFileSync(colorsDestPath, templateColors);
                        console.log('[withNotificationIcon] ✓ Created colors.xml from template');
                    }
                } else {
                    // Fallback: create colors.xml directly
                    console.log('[withNotificationIcon] Template not found, creating directly');
                    
                    if (fs.existsSync(colorsDestPath)) {
                        let existingColors = fs.readFileSync(colorsDestPath, 'utf-8');
                        if (!existingColors.includes('notification_icon_color')) {
                            existingColors = existingColors.replace(
                                '</resources>',
                                '    <color name="notification_icon_color">#1F93FF</color>\n</resources>'
                            );
                            fs.writeFileSync(colorsDestPath, existingColors);
                            console.log('[withNotificationIcon] ✓ Added notification_icon_color (fallback)');
                        }
                    } else {
                        const newColors = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="notification_icon_color">#1F93FF</color>
</resources>
`;
                        fs.writeFileSync(colorsDestPath, newColors);
                        console.log('[withNotificationIcon] ✓ Created colors.xml (fallback)');
                    }
                }

                // Verify
                if (fs.existsSync(colorsDestPath)) {
                    const finalContent = fs.readFileSync(colorsDestPath, 'utf-8');
                    const hasColor = finalContent.includes('notification_icon_color');
                    console.log('[withNotificationIcon] Final verification - has notification_icon_color:', hasColor);
                    if (!hasColor) {
                        console.error('[withNotificationIcon] ✗ CRITICAL: Color was not added!');
                    }
                } else {
                    console.error('[withNotificationIcon] ✗ CRITICAL: colors.xml does not exist!');
                }
            } catch (err) {
                console.error('[withNotificationIcon] Error handling colors:', err);
            }

            console.log('[withNotificationIcon] ====== FINISHED ======');
            return config;
        },
    ]);
};

// Plugin to add FCM notification metadata to AndroidManifest
const withFCMNotificationMetadata = (config) => {
    return withAndroidManifest(config, async (config) => {
        const mainApplication = config.modResults.manifest.application[0];
        const manifest = config.modResults.manifest;

        // Add tools namespace if not present
        if (!manifest.$['xmlns:tools']) {
            manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
        }

        // Ensure meta-data array exists
        if (!mainApplication['meta-data']) {
            mainApplication['meta-data'] = [];
        }

        const metaDataToAdd = [
            {
                $: {
                    'android:name': 'com.google.firebase.messaging.default_notification_channel_id',
                    'android:value': 'aloochat_messages',
                },
            },
            {
                $: {
                    'android:name': 'com.google.firebase.messaging.default_notification_icon',
                    'android:resource': '@drawable/ic_notification',
                    'tools:replace': 'android:resource',
                },
            },
            {
                $: {
                    'android:name': 'com.google.firebase.messaging.default_notification_color',
                    'android:resource': '@color/notification_icon_color',
                    'tools:replace': 'android:resource',
                },
            },
        ];

        // Add each meta-data if it doesn't already exist
        for (const metaData of metaDataToAdd) {
            const existingIndex = mainApplication['meta-data'].findIndex(
                (m) => m.$['android:name'] === metaData.$['android:name']
            );
            if (existingIndex >= 0) {
                // Update existing entry
                mainApplication['meta-data'][existingIndex] = metaData;
                console.log(`[withFCMNotificationMetadata] Updated ${metaData.$['android:name']}`);
            } else {
                mainApplication['meta-data'].push(metaData);
                console.log(`[withFCMNotificationMetadata] Added ${metaData.$['android:name']}`);
            }
        }

        return config;
    });
};

// Combined plugin
const withNotificationIcon = (config) => {
    config = withNotificationIconCopy(config);
    config = withFCMNotificationMetadata(config);
    return config;
};

module.exports = withNotificationIcon;
