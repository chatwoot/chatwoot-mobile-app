import * as Sentry from '@sentry/react-native';
import { getApps } from '@react-native-firebase/app';
import { waitForFirebaseInit } from './src/utils/firebaseUtils';
import * as Notifications from 'expo-notifications';

import Constants from 'expo-constants';
import App from './src/app';

// TODO: It is a temporary fix to fix the reanimated logger issue
// Ref: https://github.com/gorhom/react-native-bottom-sheet/issues/1983
// https://github.com/dohooo/react-native-reanimated-carousel/issues/706
import './reanimatedConfig';
// import './wdyr';

const isStorybookEnabled = Constants.expoConfig?.extra?.eas?.storybookEnabled;

if (!__DEV__) {
  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 1.0,
    attachScreenshot: true,
    sendDefaultPii: true,
    profilesSampleRate: 1.0,
  });
}

// Firebase initialization check - with React Native Firebase + Expo, Firebase should auto-initialize
console.log('Checking Firebase auto-initialization...');
console.log('Firebase apps length at startup:', getApps().length);

// Log Firebase status periodically to track auto-initialization
const checkFirebaseStatus = () => {
  const apps = getApps();
  console.log('Firebase apps length:', apps.length);
  if (apps.length > 0) {
    console.log('✅ Firebase auto-initialized successfully');
    console.log('Firebase app name:', apps[0].name);
  } else {
    console.log('⏳ Firebase still auto-initializing...');
  }
};

// Check Firebase status at intervals and then await readiness once
setTimeout(checkFirebaseStatus, 100);
setTimeout(checkFirebaseStatus, 500);
setTimeout(checkFirebaseStatus, 1000);

(async () => {
  const ready = await waitForFirebaseInit({ timeoutMs: 5000, pollMs: 100 });
  const apps = getApps();
  console.log('App.tsx: Firebase ready?', ready, 'apps:', apps.length);
})();

// Show alerts while app is in foreground (expo-notifications)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

if (__DEV__) {
  // eslint-disable-next-line
  require('./ReactotronConfig');
}
// Ref: https://dev.to/dannyhw/how-to-swap-between-react-native-storybook-and-your-app-p3o
export default Sentry.wrap(
  (() => {
    if (isStorybookEnabled === 'true') {
      // eslint-disable-next-line
      return require('./.storybook').default;
    }

    if (!__DEV__) {
      return Sentry.wrap(App);
    }

    console.log('Loading Development App');
    return App;
  })(),
);
