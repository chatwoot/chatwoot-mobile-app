import * as Sentry from '@sentry/react-native';
import { Alert } from 'react-native';

import i18n from '../i18n';

interface ErrorHandler {
  (e: Error, isFatal: boolean): void;
}

/**
 * Coerces a caught value into a string for display.
 *
 * Rejections reach the app as Errors, as plain objects from native modules, or
 * as bare strings. Alert passes its arguments across the bridge untouched, and
 * Android's DialogModule reads them as strings, so a non-string title or
 * message crashes the process.
 */
export const errorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    const { message } = error as { message: unknown };
    if (typeof message === 'string') {
      return message;
    }
  }
  return i18n.t('COMMON.ERROR');
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler: ErrorHandler = (e, isFatal) => {
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
    console.log(e);
  }
};

export default {
  init(): void {
    // TODO: Enable this later
    // setNativeExceptionHandler(exceptionString => {
    //   Sentry.captureException(new Error(exceptionString), {
    //     logger: 'NativeExceptionHandler',
    //   });
    // }, false);
    // setJSExceptionHandler(errorHandler, false);
  },
};
