import { store } from '@/store';
import { attachCallSessionCore } from '../callSessionCore';
import { setNativeSignedIn } from '@/services/voice/chatwootCalls';

jest.mock('@/store', () => {
  /* eslint-disable @typescript-eslint/no-require-imports */
  const { configureStore, combineReducers } = require('@reduxjs/toolkit');
  const calls = require('@/store/call/callSlice').default;
  /* eslint-enable @typescript-eslint/no-require-imports */
  const auth = (
    state: { user: object | null } = { user: { id: 1, account_id: 1, accounts: [] } },
    action: { type: string },
  ) => (action.type === 'auth/logout' ? { user: null } : state);
  return { store: configureStore({ reducer: combineReducers({ calls, auth }) }) };
});
jest.mock('../systemCall', () => ({ callerInfo: jest.fn(), systemCall: {} }));
jest.mock('@/utils/callNotifications', () => ({ takePendingCallAction: jest.fn() }));
jest.mock('@/utils/voiceCallFeedback', () => ({ reportAnswerFailure: jest.fn() }));
jest.mock('@/services/voice/chatwootCalls', () => ({
  hasNativeAudioRouting: jest.fn(() => true),
  addAudioRouteListener: jest.fn(() => ({ remove() {} })),
  addNativeCallActionListener: jest.fn(() => ({ remove() {} })),
  addTwilioCallStateListener: jest.fn(() => ({ remove() {} })),
  addTelecomUnavailableListener: jest.fn(() => ({ remove() {} })),
  getAudioRoute: jest.fn(() => ({ current: 'unknown', available: [] })),
  reportNativeCallState: jest.fn(),
  setNativeSignedIn: jest.fn(),
  startOngoingCallNotification: jest.fn(),
  stopOngoingCallNotification: jest.fn(),
  rememberNativeCall: jest.fn(),
  queueNativeEnd: jest.fn(),
  endRingingNativeCall: jest.fn(),
  isSystemCallUiAvailable: jest.fn(() => false),
}));
jest.mock('@/services/voice/callEngine', () => ({
  callEngine: {
    whatsapp: { hangup: jest.fn(async () => {}) },
    twilio: { disconnect: jest.fn(async () => {}) },
  },
}));
jest.mock('@/services/voice/webrtcEngine', () => ({
  webrtcEngine: { ensureAudioRoute: jest.fn() },
  setWebrtcConnectionLostHandler: jest.fn(),
  setMicrophoneGrantedHandler: jest.fn(),
}));

test('the native side learns when the agent signs in and out, so a signed-out phone does not ring', () => {
  const detach = attachCallSessionCore();
  try {
    expect(setNativeSignedIn).toHaveBeenLastCalledWith(true);

    store.dispatch({ type: 'auth/logout' });

    expect(setNativeSignedIn).toHaveBeenLastCalledWith(false);
  } finally {
    detach();
  }
});
