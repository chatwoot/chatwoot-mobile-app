import { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    name: 'Chatwoot',
    slug: process.env.EXPO_PUBLIC_APP_SLUG || 'chatwoot-mobile',
    version: '4.9.3',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    scheme: 'chatwootapp',
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.chatwoot.app',
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
      googleServicesFile: process.env.EXPO_PUBLIC_IOS_GOOGLE_SERVICES_FILE,
      entitlements: { 'aps-environment': 'production' },
      associatedDomains: ['applinks:app.chatwoot.com'],
    },
    android: {
      adaptiveIcon: { foregroundImage: './assets/adaptive-icon.png', backgroundColor: '#ffffff' },
      package: 'com.chatwoot.app',
      permissions: [
        'android.permission.CAMERA',
        'android.permission.RECORD_AUDIO',
        'android.permission.POST_NOTIFICATIONS',
      ],
      // Please use the relative path to the google-services.json file
      googleServicesFile: process.env.EXPO_PUBLIC_ANDROID_GOOGLE_SERVICES_FILE,
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
        projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
        storybookEnabled: process.env.EXPO_STORYBOOK_ENABLED,
      },
    },
    owner: 'chatwoot',
    plugins: [
      'expo-font',
      'expo-image',
      'expo-status-bar',
      [
        'expo-splash-screen',
        {
          image: './assets/splash.png',
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
          enableFullScreenImage_legacy: true,
        },
      ],
      [
        'react-native-permissions',
        { iosPermissions: ['Camera', 'PhotoLibrary', 'MediaLibrary', 'Notifications'] },
      ],
      [
        '@sentry/react-native',
        {
          url: 'https://sentry.io/',
          project: process.env.EXPO_PUBLIC_SENTRY_PROJECT_NAME,
          organization: process.env.EXPO_PUBLIC_SENTRY_ORG_NAME,
        },
      ],
      'expo-web-browser',
      '@react-native-community/datetimepicker',
      '@react-native-firebase/app',
      '@react-native-firebase/messaging',
      [
        'expo-build-properties',
        {
          // compileSdk/targetSdk 36 = Expo SDK 54 / RN 0.81 default (Android 16).
          // notifee (issue #808) needs compileSdk >= 35, satisfied by 36.
          android: {
            minSdkVersion: 24,
            compileSdkVersion: 36,
            targetSdkVersion: 36,
            enableProguardInReleaseBuilds: true,
          },
        },
      ],
      './with-ffmpeg-pod.js',
      './with-android-notification-channel.js',
      './with-notifee-maven-repo.js',
      './with-ios-modular-headers.js',
    ],
    androidNavigationBar: { backgroundColor: '#ffffff' },
  };
};
