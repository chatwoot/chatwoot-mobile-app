const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { getSentryExpoConfig } = require('@sentry/react-native/metro');

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
  },
};

// Custom module resolution
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Stub out problematic native modules in local dev
  if (!process.env.EAS_BUILD) {
    if (moduleName === 'react-native-snackbar') {
      return { type: 'empty' };
    }
    if (moduleName === '@react-native-community/blur') {
      return { type: 'empty' };
    }
  }

  // Stub out storybook modules when not in storybook mode to avoid missing peer deps
  if (process.env.EXPO_STORYBOOK_ENABLED !== 'true') {
    if (moduleName.startsWith('@storybook/')) {
      return { type: 'empty' };
    }
  }

  // Use default resolver for all other modules
  return context.resolveRequest(context, moduleName, platform);
};

// Conditionally apply Storybook wrapper
let finalConfig = config;

if (process.env.EXPO_STORYBOOK_ENABLED === 'true') {
  try {
    const { withStorybook } = require('@storybook/react-native/metro/withStorybook');
    finalConfig = withStorybook(config, {
      enabled: true,
      configPath: path.resolve(__dirname, './.storybook'),
    });
  } catch (error) {
    console.warn('Storybook not available, using default config:', error.message);
  }
}

module.exports = finalConfig;