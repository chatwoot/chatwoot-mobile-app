import { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  const appName = process.env.APP_NAME || process.env.EXPO_PUBLIC_APP_NAME || 'Notchat';
  const bundleId = process.env.BUNDLE_ID || process.env.EXPO_PUBLIC_ANDROID_PACKAGE || 'com.chatwoot.app';

  return {
    ...config,
    name: appName,
    slug: process.env.APP_SLUG || process.env.EXPO_PUBLIC_APP_SLUG || 'chatwoot-mobile',
    version: '4.3.10',
    orientation: 'portrait',
    icon: process.env.APP_ICON || process.env.EXPO_PUBLIC_APP_ICON || './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: false,
    scheme: process.env.APP_SCHEME || process.env.EXPO_PUBLIC_APP_SCHEME || 'chatwootapp',
    assetBundlePatterns: ['**/*'],
    splash: {
      image: process.env.SPLASH_IMAGE || process.env.EXPO_PUBLIC_SPLASH_IMAGE || './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: process.env.SPLASH_BACKGROUND_COLOR || process.env.EXPO_PUBLIC_SPLASH_BACKGROUND_COLOR || '#ffffff',
      enableFullScreenImage_legacy: true,
    },
    ios: {
      ...config.ios,
      supportsTablet: true,
      bundleIdentifier: process.env.IOS_BUNDLE_ID || bundleId,
      infoPlist: {
        UIBackgroundModes: ['fetch', 'remote-notification'],
        NSCameraUsageDescription:
          'This app requires access to the camera to upload images and videos.',
        NSPhotoLibraryUsageDescription:
          'This app requires access to the photo library to upload images.',
        NSMicrophoneUsageDescription: 'This app requires access to the microphone to record audio.',
        NSAppleMusicUsageDescription:
          'This app does not use Apple Music, but a system API may require this permission.',
        ITSAppUsesNonExemptEncryption: false,
      },
      // Please use the relative path to the google-services.json file
      googleServicesFile: process.env.IOS_GOOGLE_SERVICES_FILE || process.env.EXPO_PUBLIC_IOS_GOOGLE_SERVICES_FILE || './GoogleService-Info.plist',
      entitlements: { 'aps-environment': 'production' },
      associatedDomains: ['applinks:app.chatwoot.com'],
    },
    android: {
      ...config.android,
      adaptiveIcon: {
        foregroundImage: process.env.APP_ADAPTIVE_ICON || process.env.EXPO_PUBLIC_APP_ADAPTIVE_ICON || './assets/adaptive-icon.png',
        backgroundColor: process.env.PRIMARY_COLOR || process.env.EXPO_PUBLIC_PRIMARY_COLOR || '#ffffff',
      },
      package: process.env.ANDROID_PACKAGE || bundleId,
      versionCode: 10,
      permissions: ['android.permission.CAMERA', 'android.permission.RECORD_AUDIO'],
      // Please use the relative path to the google-services.json file
      googleServicesFile: process.env.ANDROID_GOOGLE_SERVICES_FILE || process.env.EXPO_PUBLIC_ANDROID_GOOGLE_SERVICES_FILE || './google-services.json',
      intentFilters: [
        {
          action: 'VIEW',
          autoVerify: true,
          data: [
            {
              scheme: 'https',
              host: 'app.chatwoot.com',
              pathPrefix: '/app/accounts/',
              pathPattern: '/*/conversations/*',
            },
          ],
          category: ['BROWSABLE', 'DEFAULT'],
        },
        {
          action: 'VIEW',
          data: [
            {
              scheme: 'chatwootapp',
            },
          ],
          category: ['BROWSABLE', 'DEFAULT'],
        },
      ],
    },
    extra: {
      ...config.extra,
      eas: {
        projectId: '98d5a8bb-b30f-4318-9717-380d3ec2e022',
        storybookEnabled: process.env.EXPO_STORYBOOK_ENABLED,
      },
      // Backend URL - use environment variable or default
      backendUrl: process.env.CHATWOOT_URL || process.env.EXPO_PUBLIC_BACKEND_URL || 'https://api.notchat.me',
      appName: appName,
      primaryColor: process.env.PRIMARY_COLOR || process.env.EXPO_PUBLIC_PRIMARY_COLOR || '#1FB6FF',
      secondaryColor: process.env.SECONDARY_COLOR || process.env.EXPO_PUBLIC_SECONDARY_COLOR || '#0084FF',
      accentColor: process.env.ACCENT_COLOR || process.env.EXPO_PUBLIC_ACCENT_COLOR || '#FF3B30',
      minChatwootVersion: process.env.MINIMUM_CHATWOOT_VERSION || process.env.EXPO_PUBLIC_MINIMUM_CHATWOOT_VERSION || '2.7.0',
      juneSdkKey: process.env.JUNE_SDK_KEY || process.env.EXPO_PUBLIC_JUNE_SDK_KEY || '',
      chatwootWebsiteToken: process.env.CHATWOOT_WEBSITE_TOKEN || process.env.EXPO_PUBLIC_CHATWOOT_WEBSITE_TOKEN || '',
      chatwootBaseUrl: process.env.CHATWOOT_BASE_URL || process.env.EXPO_PUBLIC_CHATWOOT_BASE_URL || '',
    },
    owner: 'juandev1998',
    plugins: [
      'expo-font',
      ['react-native-permissions', { iosPermissions: ['Camera', 'PhotoLibrary', 'MediaLibrary'] }],
      [
        '@sentry/react-native/expo',
        {
          url: 'https://sentry.io/',
          project: process.env.EXPO_PUBLIC_SENTRY_PROJECT_NAME,
          organization: process.env.EXPO_PUBLIC_SENTRY_ORG_NAME,
        },
      ],
      [
        'expo-build-properties',
        {
          // https://github.com/invertase/notifee/issues/808#issuecomment-2175934609
          android: {
            minSdkVersion: 24,
            compileSdkVersion: 35,
            targetSdkVersion: 35,
            enableProguardInReleaseBuilds: true,
            buildToolsVersion: '35.0.0',
          },
          ios: { useFrameworks: 'static', deploymentTarget: '15.1' },
        },
      ],
      '@react-native-firebase/app',
      '@react-native-firebase/messaging',
      './with-notifee-repo.js',
      './with-ffmpeg-pod.js',
    ],
    androidNavigationBar: { backgroundColor: '#ffffff' },
  };
};
