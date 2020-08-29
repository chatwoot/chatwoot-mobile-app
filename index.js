import { AppRegistry } from 'react-native';
import * as Sentry from '@sentry/react-native';

import { name as appName } from './app.json';

import { SENTRY_TOKEN_URL } from './sentry';

import App from './src/app';

AppRegistry.registerComponent(appName, () => App);

Sentry.init({
  dsn: SENTRY_TOKEN_URL,
});
