import { ExpoConfig, ConfigContext } from 'expo/config';

const isProd = process.env.ENVIRONMENT === 'prod';

const getBundleIdentifier = () => {
  if (isProd) {
    return 'com.chatscommerce.app';
  }

  return 'com.chatscommerce.app.dev';
};

const getAppName = () => {
  if (isProd) {
    return 'Chatscommerce';
  }

  return 'Chatscommerce Dev';
};

const getAppLinkDomains = () => {
  if (isProd) {
    return ['applinks:app.chatscommerce.com'];
  }

  return ['applinks:dev.app.chatscommerce.com'];
};

const getAppIcon = () => {
  if (isProd) {
    return './assets/icon.png';
  }

  return './assets/icon-dev.png';
};

const getAdaptiveIcon = () => {
  if (isProd) {
    return './assets/adaptive-icon.png';
  }

  return './assets/adaptive-icon-dev.png';
};

const getAppScheme = () => {
  if (isProd) {
    return 'chatscommerce';
  }

  return 'chatscommerce-dev';
};

const getHost = () => {
  if (isProd) {
    return 'app.chatscommerce.com';
  }
  return 'dev.app.chatscommerce.com';
};

export default ({ config }: ConfigContext): ExpoConfig => {
  // Use the copied Google services files from the native directories
  const ANDROID_GSF = './android/app/google-services.json';
  const IOS_PLIST = './ios/GoogleService-Info.plist';

  // Helpful logs in EAS build to confirm env injection
  // These will appear early in build logs
  // eslint-disable-next-line no-console
  // eslint-disable-next-line no-console
  console.log(
    '[config] EAS environment:',
    process.env.EAS_BUILD_PROFILE || process.env.ENVIRONMENT,
  );
  // eslint-disable-next-line no-console
  console.log('[config] GOOGLE_SERVICES_JSON (env):', process.env.GOOGLE_SERVICES_JSON);
  // eslint-disable-next-line no-console
  console.log('[config] ANDROID googleServicesFile (resolved):', ANDROID_GSF);
  // eslint-disable-next-line no-console
  console.log('[config] GOOGLE_SERVICE_INFO_PLIST (env):', process.env.GOOGLE_SERVICE_INFO_PLIST);
  // eslint-disable-next-line no-console
  console.log('[config] IOS googleServicesFile (resolved):', IOS_PLIST);

  return {
    ...config,
    name: getAppName(),
    slug: process.env.EXPO_PUBLIC_APP_SLUG || 'chatscommerce',
    scheme: getAppScheme(),
    // Required for EAS Update; prevents Expo CLI from trying to auto-write to dynamic config
    updates: {
      url: 'https://u.expo.dev/c388de6e-16cf-4618-b94e-a45c450845dc',
    },
    runtimeVersion: '1.0.0',
    version: '4.0.19',
    orientation: 'portrait',
    icon: getAppIcon(),
    userInterfaceStyle: 'light',
    newArchEnabled: false,
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#5d17eb',
      enableFullScreenImage_legacy: true,
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: getBundleIdentifier(),
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
      // Prefer EAS Secret File env var; fallback to repo path for local builds
      googleServicesFile: IOS_PLIST,
      entitlements: { 'aps-environment': 'production' },
      associatedDomains: getAppLinkDomains(),
    },
    android: {
      adaptiveIcon: {
        foregroundImage: getAdaptiveIcon(),
        backgroundColor: '#5d17eb',
      },
      package: getBundleIdentifier(),
      permissions: [
        'android.permission.CAMERA',
        'android.permission.READ_EXTERNAL_STORAGE',
        'android.permission.WRITE_EXTERNAL_STORAGE',
        'android.permission.RECORD_AUDIO',
        'android.permission.READ_MEDIA_IMAGES',
      ],
      // Prefer EAS Secret File env var; fallback to repo path for local builds
      googleServicesFile: ANDROID_GSF,
      intentFilters: [
        {
          action: 'VIEW',
          autoVerify: true,
          data: [
            {
              scheme: 'https',
              host: getHost(),
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
        projectId: 'c388de6e-16cf-4618-b94e-a45c450845dc',
        storybookEnabled: process.env.EXPO_STORYBOOK_ENABLED,
      },
    },
    owner: 'eleva-labs',
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
      '@react-native-firebase/app',
      '@react-native-firebase/messaging',
      [
        'expo-notifications',
        {
          color: '#ffffff',
        },
      ],
      [
        'expo-build-properties',
        {
          // https://github.com/invertase/notifee/issues/808#issuecomment-2175934609
          android: {
            minSdkVersion: 24,
            compileSdkVersion: 35,
            targetSdkVersion: 34,
            enableProguardInReleaseBuilds: true,
          },
          ios: { useFrameworks: 'static' },
        },
      ],
    ],
    androidNavigationBar: { backgroundColor: '#ffffff' },
  };
};
