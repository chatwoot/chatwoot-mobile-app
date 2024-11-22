import * as Sentry from '@sentry/react-native';

import App from './src/app';
if (!__DEV__) {
  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 1.0,
    attachScreenshot: true,
  });
}

if (__DEV__) {
  // require('./ReactotronConfig');
}
export default !__DEV__ ? Sentry.wrap(App) : App;
