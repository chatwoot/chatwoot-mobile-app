import * as Sentry from '@sentry/react-native';
import { Alert } from 'react-native';
import { setJSExceptionHandler, setNativeExceptionHandler } from 'react-native-exception-handler';

import i18n from '../i18n';

const errorHandler = (e, isFatal) => {
  Sentry.captureException(e);
  if (isFatal) {
    Alert.alert(
      i18n.t('COMMON.ERROR_TITLE'),
      `${i18n.t('COMMON.ERROR')}: ${isFatal ? 'Fatal:' : ''} ${e.name} ${e.message}${i18n.t(
        'COMMON.REPORT_MESSAGE',
      )}`,
      [
        {
          text: i18n.t('COMMON.CLOSE'),
        },
      ],
    );
  } else {
    // eslint-disable-next-line no-console
    console.log(e); // So that we can see it in the ADB logs in case of Android if needed
  }
};

export default {
  init() {
    setNativeExceptionHandler((exceptionString) => {
      // log error to Sentry
      Sentry.captureException(new Error(exceptionString), {
        logger: 'NativeExceptionHandler',
      });
    }, false);

    setJSExceptionHandler(errorHandler, false);
  },
};
