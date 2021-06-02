import { AppRegistry } from 'react-native';
import * as Sentry from '@sentry/react-native';
import Config from 'react-native-config';
import { name as appName } from './app.json';
import { initAnalytics } from './src/helpers/Analytics';

import App from './src/app';

AppRegistry.registerComponent(appName, () => App);
Sentry.init({
  dsn: Config.SENTRY_DSN,
});
initAnalytics();
