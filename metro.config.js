const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { getSentryExpoConfig } = require('@sentry/react-native/metro');
const withStorybook = require('@storybook/react-native/metro/withStorybook');

/** @type {import('expo/metro-config').MetroConfig} */
const defaultConfig = getDefaultConfig(__dirname);
const sentryConfig = getSentryExpoConfig(__dirname);

// Merge Sentry config with default config
const config = {
  ...defaultConfig,
  ...sentryConfig,
  resolver: {
    ...defaultConfig.resolver,
    ...sentryConfig.resolver,
    resolveRequest: (context, moduleName, platform) => {
      // Mock react-native-snackbar to prevent native module errors in Expo Go
      if (moduleName === 'react-native-snackbar') {
        return {
          type: 'empty',
        };
      }
      // Mock @react-native-community/blur to prevent native module errors in Expo Go
      if (moduleName === '@react-native-community/blur') {
        return {
          type: 'empty',
        };
      }
      // Use default resolver for all other modules
      return context.resolveRequest(context, moduleName, platform);
    },
  },
};

module.exports = withStorybook(config, {
  enabled: true,
  configPath: path.resolve(__dirname, './.storybook'),
});
