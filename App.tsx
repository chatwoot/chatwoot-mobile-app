// import * as Sentry from '@sentry/react-native';

// CRITICAL: Register background message handler as early as possible
// This must be at the top of the app entry point for background notifications to work
import './src/services/expoBackgroundHandler';

import App from './src/app';

let Sentry: any = {
  init: () => {},
  wrap: (component: any) => component,
  captureException: () => {},
};

try {
  Sentry = require('@sentry/react-native');
} catch (e) {
  console.warn('@sentry/react-native not available');
}

// TODO: It is a temporary fix to fix the reanimated logger issue
// Ref: https://github.com/gorhom/react-native-bottom-sheet/issues/1983
// https://github.com/dohooo/react-native-reanimated-carousel/issues/706
import './reanimatedConfig';
// import './wdyr';

if (!__DEV__) {
  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 1.0,
    attachScreenshot: true,
  });
}

if (__DEV__) {
  // eslint-disable-next-line
  require('./ReactotronConfig');
}

export default (() => {
  if (!__DEV__) {
    return Sentry.wrap(App);
  }

  console.log('Loading Development App');
  return App;
})();
