import * as Sentry from '@sentry/react-native';

import Constants from 'expo-constants';
import App from './src/app';

const isStorybookEnabled = Constants.expoConfig?.extra?.eas?.storybookEnabled;

if (!__DEV__) {
  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 1.0,
    attachScreenshot: true,
  });
}

if (__DEV__) {
  require('./ReactotronConfig');
}

// Ref: https://dev.to/dannyhw/how-to-swap-between-react-native-storybook-and-your-app-p3o
export default isStorybookEnabled
  ? // eslint-disable-next-line
    require('./.storybook').default
  : !__DEV__
    ? Sentry.wrap(App)
    : App;
