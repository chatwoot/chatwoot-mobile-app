import * as Sentry from '@sentry/react-native';

export const callLogger = {
  reportFailure: (failure: string, error: unknown) => {
    Sentry.captureException(error, { tags: { 'voice.failure': failure } });
  },
};
