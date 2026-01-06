import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    name: 'AlooChat',
    slug: process.env.EXPO_PUBLIC_APP_SLUG || 'aloo-chat-app',
    owner: 'aloochat',
    version: '4.3.12',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: false,
    scheme: 'AlooChatapp',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.aloochat.app',
      infoPlist: {
        NSCameraUsageDescription:
          'This app requires access to the camera to upload images and videos.',
        NSPhotoLibraryUsageDescription:
          'This app requires access to the photo library to upload images.',
        NSMicrophoneUsageDescription: 'This app requires access to the microphone to record audio.',
        NSAppleMusicUsageDescription:
          'This app does not use Apple Music, but a system API may require this permission.',
        UIBackgroundModes: ['fetch', 'remote-notification'],
        ITSAppUsesNonExemptEncryption: false,
      },
      // Please use the relative path to the google-services.json file
      googleServicesFile:
        process.env.EXPO_PUBLIC_IOS_GOOGLE_SERVICES_FILE || './GoogleService-Info.plist',
      entitlements: { 'aps-environment': 'production' },
      associatedDomains: ['applinks:cx.aloochat.ai'],
    },
    android: {
      package: 'com.aloochat.app',
      permissions: [
        'android.permission.CAMERA',
        'android.permission.RECORD_AUDIO',
        'android.permission.POST_NOTIFICATIONS',
        'android.permission.RECEIVE_BOOT_COMPLETED',
        'android.permission.VIBRATE',
      ],
      // Please use the relative path to the google-services.json file
      googleServicesFile:
        process.env.EXPO_PUBLIC_ANDROID_GOOGLE_SERVICES_FILE || './google-services.json',
      intentFilters: [
        {
          action: 'VIEW',
          autoVerify: true,
          data: [
            {
              scheme: 'https',
              host: 'cx.aloochat.ai',
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
              scheme: 'AlooChatapp',
            },
          ],
          category: ['BROWSABLE', 'DEFAULT'],
        },
      ],
    },
    extra: {
      eas: {
        projectId: process.env.EXPO_PUBLIC_PROJECT_ID || '702829cd-b41f-4649-aee4-606570ba876e',
        storybookEnabled: process.env.EXPO_STORYBOOK_ENABLED,
      },
    },
    plugins: [
      'expo-font',
      'expo-notifications',
      ['react-native-permissions', { iosPermissions: ['Camera', 'PhotoLibrary', 'MediaLibrary', 'Notifications'] }],
      [
        '@sentry/react-native/expo',
        {
          url: 'https://sentry.io/',
          project: process.env.EXPO_PUBLIC_SENTRY_PROJECT_NAME,
          organization: process.env.EXPO_PUBLIC_SENTRY_ORG_NAME,
        },
      ],
      '@react-native-firebase/app',
      '@react-native-firebase/messaging',
      [
        'expo-build-properties',
        {
          // https://github.com/invertase/notifee/issues/808#issuecomment-2175934609
          android: {
            minSdkVersion: 24,
            compileSdkVersion: 35,
            targetSdkVersion: 34,
            enableProguardInReleaseBuilds: false,
            // Only build for ARM architectures to save memory and time
            abiFilters: ['armeabi-v7a', 'arm64-v8a'],
          },
          ios: { useFrameworks: 'static' },
        },
      ],
      './withNotificationIcon.js',
    ],
    androidNavigationBar: { backgroundColor: '#ffffff' },
  };
};
