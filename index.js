import { AppRegistry } from 'react-native';
import * as Sentry from '@sentry/react-native';
import Config from 'react-native-config';
import { name as appName } from './app.json';
import { initAnalytics } from './src/helpers/Analytics';

import App from './src/app';

let RegisteredApp = App;
// Comment this line if you don't want to use Storybook
// RegisteredApp = __DEV__ ? require('./storybook').default : App;

AppRegistry.registerComponent(appName, () => RegisteredApp);

if (!__DEV__) {
  Sentry.init({
    dsn: Config.SENTRY_DSN,
    tracesSampleRate: 1.0,
  });
}
initAnalytics();
