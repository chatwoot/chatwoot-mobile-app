const { withDangerousMod, withAndroidManifest } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

// Plugin to copy notification icon from assets to drawable
const withNotificationIconCopy = (config) => {
    return withDangerousMod(config, [
        'android',
        async (config) => {
            const projectRoot = config.modRequest.projectRoot;
            const sourcePath = path.join(projectRoot, 'assets', 'ic_notification.xml');
            const destPath = path.join(
                projectRoot,
                'android',
                'app',
                'src',
                'main',
                'res',
                'drawable',
                'ic_notification.xml'
            );

            if (fs.existsSync(sourcePath)) {
                // Ensure drawable directory exists
                const drawableDir = path.dirname(destPath);
                if (!fs.existsSync(drawableDir)) {
                    fs.mkdirSync(drawableDir, { recursive: true });
                }

                // Read and write file
                const contents = fs.readFileSync(sourcePath, 'utf-8');
                fs.writeFileSync(destPath, contents);
                console.log('[withNotificationIcon] Copied ic_notification.xml to drawable');
            }

            // Also add notification_icon_color to colors.xml
            const valuesDir = path.join(
                projectRoot,
                'android',
                'app',
                'src',
                'main',
                'res',
                'values'
            );
            const colorsPath = path.join(valuesDir, 'colors.xml');

            // Ensure values directory exists
            if (!fs.existsSync(valuesDir)) {
                fs.mkdirSync(valuesDir, { recursive: true });
            }

            if (fs.existsSync(colorsPath)) {
                let colorsContent = fs.readFileSync(colorsPath, 'utf-8');
                if (!colorsContent.includes('notification_icon_color')) {
                    colorsContent = colorsContent.replace(
                        '</resources>',
                        '  <color name="notification_icon_color">#1F93FF</color>\n</resources>'
                    );
                    fs.writeFileSync(colorsPath, colorsContent);
                    console.log('[withNotificationIcon] Added notification_icon_color to colors.xml');
                }
            } else {
                // Create colors.xml if it doesn't exist
                const colorsContent = `<?xml version="1.0" encoding="utf-8"?>
<resources>
  <color name="notification_icon_color">#1F93FF</color>
</resources>
`;
                fs.writeFileSync(colorsPath, colorsContent);
                console.log('[withNotificationIcon] Created colors.xml with notification_icon_color');
            }

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
