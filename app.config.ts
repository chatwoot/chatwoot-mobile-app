import { ExpoConfig, ConfigContext } from 'expo/config';

// Helper functions are now defined inside the export function

export default ({ config }: ConfigContext): ExpoConfig => {
  // Check environment - EAS sets ENVIRONMENT in env, and build profile info is available
  console.log('[app.config] ENVIRONMENT:', process.env.ENVIRONMENT);
  console.log('[app.config] EAS_BUILD_PROFILE:', process.env.EAS_BUILD_PROFILE);

  const isProd =
    process.env.ENVIRONMENT === 'prod' || process.env.EAS_BUILD_PROFILE === 'production';
  console.log('[app.config] isProd:', isProd);
  // Helper functions that depend on isProd
  const getBundleIdentifier = () => {
    const bundleId = isProd ? 'com.chatscommerce.app' : 'com.chatscommerce.app.dev';
    console.log('[app.config] Android Bundle Identifier:', bundleId);
    return bundleId;
  };
  const getAppName = () => (isProd ? 'Chatscommerce' : 'Chatscommerce Dev');
  const getAppLinkDomains = () =>
    isProd ? ['applinks:app.chatscommerce.com'] : ['applinks:dev.app.chatscommerce.com'];
  const getAppIcon = () => (isProd ? './assets/icon.png' : './assets/icon-dev.png');
  const getAdaptiveIcon = () =>
    isProd ? './assets/adaptive-icon.png' : './assets/adaptive-icon-dev.png';
  const getAppScheme = () => (isProd ? 'chatscommerce' : 'chatscommerce-dev');
  const getHost = () => (isProd ? 'app.chatscommerce.com' : 'dev.app.chatscommerce.com');

  // Google Services file resolution with priority:
  // 1. EAS environment variables (for cloud builds)
  // 2. Native directories (for local dev after copy)
  // 3. Credentials directory (for local dev fallback)
  const fs = require('fs');
  const getAndroidGSF = () => {
    // Priority 1: EAS Secret File environment variable
    if (process.env.GOOGLE_SERVICES_JSON && fs.existsSync(process.env.GOOGLE_SERVICES_JSON)) {
      return process.env.GOOGLE_SERVICES_JSON;
    }
    
    // Priority 2: Copied to native directory (local dev)
    const nativeFile = './android/app/google-services.json';
    if (fs.existsSync(nativeFile)) return nativeFile;
    
    // Priority 3: Credentials directory fallback
    const credentialsFile = isProd ? './credentials/android/google-services.json' : './credentials/android/google-services-dev.json';
    if (fs.existsSync(credentialsFile)) return credentialsFile;
    
    // Default fallback
    return nativeFile;
  };
  
  const getIosPlist = () => {
    // Priority 1: EAS Secret File environment variable  
    if (process.env.GOOGLE_SERVICE_INFO_PLIST && fs.existsSync(process.env.GOOGLE_SERVICE_INFO_PLIST)) {
      return process.env.GOOGLE_SERVICE_INFO_PLIST;
    }
    
    // Priority 2: Copied to native directory (local dev)
    const nativeFile = './ios/GoogleService-Info.plist';
    if (fs.existsSync(nativeFile)) return nativeFile;
    
    // Priority 3: Credentials directory fallback
    const credentialsFile = isProd ? './credentials/ios/GoogleService-Info.plist' : './credentials/ios/GoogleService-Info-dev.plist';
    if (fs.existsSync(credentialsFile)) return credentialsFile;
    
    // Default fallback
    return nativeFile;
  };

  // Resolve the actual file paths
  const resolvedAndroidGSF = getAndroidGSF();
  const resolvedIosPlist = getIosPlist();

  // Helpful logs in EAS build to confirm env injection and file resolution
  // These will appear early in build logs
  // eslint-disable-next-line no-console
  console.log(
    '[config] EAS environment:',
    process.env.EAS_BUILD_PROFILE || process.env.ENVIRONMENT,
  );
  // eslint-disable-next-line no-console
  console.log('[config] GOOGLE_SERVICES_JSON (env):', process.env.GOOGLE_SERVICES_JSON);
  // eslint-disable-next-line no-console
  console.log('[config] ANDROID googleServicesFile (resolved):', resolvedAndroidGSF);
  // eslint-disable-next-line no-console
  console.log('[config] GOOGLE_SERVICE_INFO_PLIST (env):', process.env.GOOGLE_SERVICE_INFO_PLIST);
  // eslint-disable-next-line no-console
  console.log('[config] IOS googleServicesFile (resolved):', resolvedIosPlist);

  const APP_VERSION = '4.0.21';

  return {
    ...config,
    name: getAppName(),
    slug: process.env.EXPO_PUBLIC_APP_SLUG || 'chatscommerce',
    scheme: getAppScheme(),
    // Disable OTA updates (EAS Update)
    updates: {
      enabled: false,
    },
    runtimeVersion: '1.0.0',
    version: APP_VERSION,
    orientation: 'portrait',
    icon: getAppIcon(),
    userInterfaceStyle: 'automatic',
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
          'This app uses the camera to take photos and videos that you can attach to your customer conversations. For example, you can take a photo of a product or document to share with customers during support chats.',
        NSPhotoLibraryUsageDescription:
          'This app accesses your photo library to select existing photos and videos that you can attach to customer conversations. For example, you can select product images, screenshots, or documents from your gallery to share with customers.',
        NSMicrophoneUsageDescription:
          'This app uses the microphone to record voice messages that you can send to customers during conversations. For example, you can record a quick audio explanation or voice note to provide more personal support.',
        NSAppleMusicUsageDescription:
          'This app does not use Apple Music, but a system API may require this permission.',
        UIBackgroundModes: ['fetch', 'remote-notification'],
        ITSAppUsesNonExemptEncryption: false,
      },
      // Prefer EAS Secret File env var; fallback to repo path for local builds
      googleServicesFile: resolvedIosPlist,
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
      googleServicesFile: resolvedAndroidGSF,
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
      'expo-notifications',
      [
        'expo-build-properties',
        {
          // https://github.com/invertase/notifee/issues/808#issuecomment-2175934609
          android: {
            minSdkVersion: 24,
            compileSdkVersion: 35,
            targetSdkVersion: 35,
            enableProguardInReleaseBuilds: true,
            // Support for 16 KB memory page sizes
            ndk: {
              abiFilters: ['arm64-v8a', 'armeabi-v7a', 'x86', 'x86_64'],
            },
          },
          ios: { useFrameworks: 'static' },
        },
      ],
      './plugins/simple-manifest-fix',
    ],
    androidNavigationBar: { backgroundColor: '#ffffff' },
  };
};
