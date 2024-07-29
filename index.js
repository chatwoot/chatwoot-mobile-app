import { AppRegistry, LogBox } from 'react-native';
import * as Sentry from '@sentry/react-native';
import Config from 'react-native-config';
import { name as appName } from './app.json';

LogBox.ignoreLogs(['Warning: Function components cannot have defaultProps']);

import App from './src/app';

AppRegistry.registerComponent(appName, () => App);
if (!__DEV__) {
  Sentry.init({
    dsn: Config.SENTRY_DSN,
    tracesSampleRate: 1.0,
    attachScreenshot: true,
  });
}
