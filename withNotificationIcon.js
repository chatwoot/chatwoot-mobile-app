const { withDangerousMod, withAndroidManifest } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

// Plugin to copy notification icon to Android drawable resources
const withNotificationIconCopy = (config) => {
    return withDangerousMod(config, [
        'android',
        async (config) => {
            const projectRoot = config.modRequest.projectRoot;
            const platformProjectRoot = config.modRequest.platformProjectRoot;
            
            console.log('[withNotificationIcon] Copying notification icon...');
            
            // Copy notification icon from assets to drawable
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
                    console.log('[withNotificationIcon] ✓ Copied ic_notification.xml');
                } else {
                    console.warn('[withNotificationIcon] ✗ ic_notification.xml not found at:', iconSourcePath);
                }
            } catch (err) {
                console.error('[withNotificationIcon] Error copying icon:', err);
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

        // Only add channel and icon - color will be set in JavaScript via Notifee
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
