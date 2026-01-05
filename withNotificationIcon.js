const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const withNotificationIcon = (config) => {
    return withDangerousMod(config, [
        'android',
        async (config) => {
            const projectRoot = config.modRequest.projectRoot;
            const invalidPath = path.join(projectRoot, 'assets', 'ic_notification.xml');
            const validPath = path.join(
                projectRoot,
                'android',
                'app',
                'src',
                'main',
                'res',
                'drawable',
                'ic_notification.xml'
            );

            if (fs.existsSync(invalidPath)) {
                // Ensure drawable directory exists
                const drawableDir = path.dirname(validPath);
                if (!fs.existsSync(drawableDir)) {
                    fs.mkdirSync(drawableDir, { recursive: true });
                }

                // Read file
                const contents = fs.readFileSync(invalidPath, 'utf-8');
                // Write file
                fs.writeFileSync(validPath, contents);
            }
            return config;
        },
    ]);
};

module.exports = withNotificationIcon;
