import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    name: 'BuddyHelp',
    slug: 'buddyhelp',
    version: '0.1.5',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'org.buddyhelp.app',
      infoPlist: {
        NSCameraUsageDescription:
          'This app requires access to the camera to upload images and videos.',
        NSPhotoLibraryUsageDescription:
          'This app requires access to the photo library to upload images.',
        NSMicrophoneUsageDescription: 'This app requires access to the microphone to record audio.',
        NSAppleMusicUsageDescription:
          'This app does not use Apple Music, but a system API may require this permission.',
        UIBackgroundModes: ['fetch', 'remote-notification'],
      },
      // Please use the relative path to the google-services.json file
      googleServicesFile: 'GoogleService-Info.plist',
      entitlements: {
        'aps-environment': 'production',
      },
      associatedDomains: ['applinks:app.chatwoot.com'],
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      package: 'org.buddyhelp.app',
      permissions: [
        'android.permission.CAMERA',
        'android.permission.READ_EXTERNAL_STORAGE',
        'android.permission.WRITE_EXTERNAL_STORAGE',
        'android.permission.RECORD_AUDIO',
      ],
      // Please use the relative path to the google-services.json file
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON || 'google-services.json',
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
      ],
    },
    extra: {
      eas: {
        projectId: 'effc2cf0-e2a3-4e8f-8ff1-ed9ef0e876ca',
      },
    },
    owner: 'buddyhelp',
    plugins: [
      [
        'react-native-permissions',
        {
          iosPermissions: ['Camera', 'PhotoLibrary', 'MediaLibrary'],
        },
      ],
      [
        '@sentry/react-native/expo',
        {
          url: process.env.EXPO_PUBLIC_SENTRY_URL,
          project: 'buddyhelp',
          organization: 'buddyhelp',
          
        },
      ],
      '@react-native-firebase/app',
      '@react-native-firebase/messaging',
      [
        'expo-build-properties',
        {
          // https://github.com/invertase/notifee/issues/808#issuecomment-2175934609
          android: {
            compileSdkVersion: 34,
            targetSdkVersion: 34,
            extraMavenRepos: ['$rootDir/../../../node_modules/@notifee/react-native/android/libs'],
          },
          ios: {
            useFrameworks: 'static',
          },
        },
      ],
    ],
    androidNavigationBar: {
      backgroundColor: '#ffffff',
    },
  };
};
