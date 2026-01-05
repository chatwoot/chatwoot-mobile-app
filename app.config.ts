import { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    name: process.env.EXPO_PUBLIC_APP_NAME || 'notchat',
    slug: process.env.EXPO_PUBLIC_APP_SLUG || 'chatwoot-mobile',
    version: '4.3.10',
    orientation: 'portrait',
    icon: process.env.EXPO_PUBLIC_APP_ICON || './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: false,
    scheme: process.env.EXPO_PUBLIC_APP_SCHEME || 'chatwootapp',
    assetBundlePatterns: ['**/*'],
    splash: {
      image: process.env.EXPO_PUBLIC_SPLASH_IMAGE || './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: process.env.EXPO_PUBLIC_SPLASH_BACKGROUND_COLOR || '#ffffff',
      enableFullScreenImage_legacy: true,
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: process.env.EXPO_PUBLIC_IOS_BUNDLE_IDENTIFIER || 'com.chatwoot.app',
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
      googleServicesFile: process.env.EXPO_PUBLIC_IOS_GOOGLE_SERVICES_FILE || './GoogleService-Info.plist',
      entitlements: { 'aps-environment': 'production' },
      associatedDomains: ['applinks:app.chatwoot.com'],
    },
    android: {
      adaptiveIcon: {
        foregroundImage: process.env.EXPO_PUBLIC_APP_ADAPTIVE_ICON || './assets/adaptive-icon.png',
        backgroundColor: process.env.EXPO_PUBLIC_PRIMARY_COLOR || '#ffffff',
      },
      package: process.env.EXPO_PUBLIC_ANDROID_PACKAGE || 'com.chatwoot.app',
      versionCode: 10,
      permissions: ['android.permission.CAMERA', 'android.permission.RECORD_AUDIO'],
      // Please use the relative path to the google-services.json file
      googleServicesFile: process.env.EXPO_PUBLIC_ANDROID_GOOGLE_SERVICES_FILE || './google-services.json',
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
      eas: {
        projectId: '98d5a8bb-b30f-4318-9717-380d3ec2e022',
        storybookEnabled: process.env.EXPO_STORYBOOK_ENABLED,
      },
      // Backend URL - use environment variable or default
      // For local testing, create a .env file with: EXPO_PUBLIC_BACKEND_URL=http://192.168.18.103:8000
      // IMPORTANTE: Use o IP da sua máquina na rede local, não localhost
      backendUrl: process.env.EXPO_PUBLIC_BACKEND_URL || 'https://api.notchat.me',
      appName: process.env.EXPO_PUBLIC_APP_NAME || 'Notchat',
      primaryColor: process.env.EXPO_PUBLIC_PRIMARY_COLOR || '#1FB6FF',
      secondaryColor: process.env.EXPO_PUBLIC_SECONDARY_COLOR || '#0084FF',
      accentColor: process.env.EXPO_PUBLIC_ACCENT_COLOR || '#FF3B30',
      minChatwootVersion: process.env.EXPO_PUBLIC_MINIMUM_CHATWOOT_VERSION || '2.7.0',
      juneSdkKey: process.env.EXPO_PUBLIC_JUNE_SDK_KEY || '',
      chatwootWebsiteToken: process.env.EXPO_PUBLIC_CHATWOOT_WEBSITE_TOKEN || '',
      chatwootBaseUrl: process.env.EXPO_PUBLIC_CHATWOOT_BASE_URL || '',
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
