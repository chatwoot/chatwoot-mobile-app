const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { getSentryExpoConfig } = require('@sentry/react-native/metro');
const withStorybook = require('@storybook/react-native/metro/withStorybook');
const { resolve } = require('metro-resolver');

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
    // Prefer browser-compatible entrypoints for RN
    resolverMainFields: ['react-native', 'browser', 'main'],
    // Avoid package exports resolving to Node-specific builds (e.g., axios/dist/node)
    unstable_enablePackageExports: false,
    resolveRequest: (context, moduleName, platform) => {
      if (moduleName === 'axios') {
        return {
          type: 'sourceFile',
          filePath: path.resolve(__dirname, 'node_modules/axios/dist/browser/axios.cjs'),
        };
      }
      if (context.resolveRequest) {
        return context.resolveRequest(context, moduleName, platform);
      }
      return resolve(context, moduleName, platform);
    },
  },
};

module.exports = withStorybook(config, {
  enabled: true,
  configPath: path.resolve(__dirname, './.storybook'),
});
