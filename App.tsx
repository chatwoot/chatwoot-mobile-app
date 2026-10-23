import * as Sentry from '@sentry/react-native';
import { AppRegistry, Platform } from 'react-native';

import Constants from 'expo-constants';
import App from './src/app';
import { isUnreportableError } from './src/utils/sentryUtils';

// TODO: It is a temporary fix to fix the reanimated logger issue
// Ref: https://github.com/gorhom/react-native-bottom-sheet/issues/1983
// https://github.com/dohooo/react-native-reanimated-carousel/issues/706
import './reanimatedConfig';
import { CALL_SESSION_TASK, runCallSessionTask } from './src/services/voice/callSessionTask';
import { LockScreenCallRoot } from './src/screens/call';
import { LOCK_SCREEN_CALL_COMPONENT } from '@/services/voice/chatwootCalls';
// import './wdyr';

const isStorybookEnabled = Constants.expoConfig?.extra?.eas?.storybookEnabled;

// A call answered on Android's lock screen runs here until it ends, and its screen is
// drawn by the lock-screen activity from the same call screen the app shows
if (Platform.OS === 'android') {
  AppRegistry.registerHeadlessTask(CALL_SESSION_TASK, () => runCallSessionTask);
  AppRegistry.registerComponent(LOCK_SCREEN_CALL_COMPONENT, () => LockScreenCallRoot);
}

if (!__DEV__) {
  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.05,
    beforeSend: (event, hint) => (isUnreportableError(hint?.originalException) ? null : event),
  });
}

if (__DEV__) {
  // eslint-disable-next-line
  require('./ReactotronConfig');
}
// Ref: https://dev.to/dannyhw/how-to-swap-between-react-native-storybook-and-your-app-p3o
export default (() => {
  if (isStorybookEnabled === 'true') {
    // eslint-disable-next-line
    return require('./.storybook').default;
  }

  if (!__DEV__) {
    return Sentry.wrap(App);
  }

  console.log('Loading Development App');
  return App;
})();
