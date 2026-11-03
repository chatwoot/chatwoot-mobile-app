import { configureStore } from '@reduxjs/toolkit';
import * as Sentry from '@sentry/react-native';

import { MicrophoneDeniedError } from '@/services/voice/callErrors';
import { callActions } from '@/store/call/callActions';
import { callListenerMiddleware } from '@/store/call/callListener';

jest.mock('@sentry/react-native', () => ({ captureException: jest.fn() }));

const store = configureStore({
  reducer: (state = {}) => state,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().prepend(callListenerMiddleware.middleware),
});

const rejectJoin = async (error: Error) => {
  store.dispatch(callActions.joinCall.rejected(error, 'request-id', 'CA1'));
  await Promise.resolve();
};

describe('callListener', () => {
  beforeEach(() => jest.clearAllMocks());

  it('reports a failed call action tagged with the action', async () => {
    await rejectJoin(new Error('Joining the call failed: failed'));

    expect(Sentry.captureException).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Joining the call failed: failed' }),
      { tags: { 'voice.failure': 'calls/joinCall' } },
    );
  });

  it('skips denied microphone access', async () => {
    await rejectJoin(new MicrophoneDeniedError());

    expect(Sentry.captureException).not.toHaveBeenCalled();
  });

  it('skips requests that got no usable response', async () => {
    await rejectJoin(Object.assign(new Error('Network Error'), { code: 'ERR_NETWORK' }));
    await rejectJoin(Object.assign(new Error('Request failed'), { code: 'ERR_BAD_RESPONSE' }));

    expect(Sentry.captureException).not.toHaveBeenCalled();
  });
});
