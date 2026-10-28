import { Platform } from 'react-native';
import { request, RESULTS } from 'react-native-permissions';
import { store } from '@/store';
import { systemCall } from '../systemCall';
import { addCall } from '@/store/call/callSlice';
import { twilioConnect, twilioDisconnect } from '@/services/voice/chatwootCalls';

jest.mock('@/store', () => {
  /* eslint-disable @typescript-eslint/no-require-imports */
  const { configureStore } = require('@reduxjs/toolkit');
  const calls = require('@/store/call/callSlice').default;
  /* eslint-enable @typescript-eslint/no-require-imports */
  return {
    store: configureStore({
      reducer: { calls, auth: (state = { user: { id: 1, account_id: 1, accounts: [] } }) => state },
    }),
  };
});
jest.mock('@/services/voice/chatwootCalls', () => ({
  ...jest.requireActual('@/services/voice/chatwootCalls'),
  isNativeCallsAvailable: jest.fn(() => true),
  twilioConnect: jest.fn(),
  twilioDisconnect: jest.fn(),
}));
jest.mock('@/store/call/callService', () => ({
  CallService: {
    getConferenceToken: jest.fn(async () => ({ token: 'token' })),
    joinConference: jest.fn(async () => ({ conference_sid: 'conference' })),
    leaveConference: jest.fn(async () => ({})),
  },
}));

test('End while microphone permission is pending does not later start a Twilio connection', async () => {
  jest.replaceProperty(Platform, 'OS', 'android');
  let allow!: (value: string) => void;
  let connected!: () => void;
  (request as jest.Mock).mockImplementationOnce(
    () =>
      new Promise(resolve => {
        allow = resolve;
      }),
  );
  (twilioConnect as jest.Mock).mockImplementationOnce(
    () =>
      new Promise<void>(resolve => {
        connected = resolve;
      }),
  );
  store.dispatch(
    addCall({
      callSid: 'permission',
      provider: 'twilio',
      callDirection: 'inbound',
      inboxId: 3,
      conversationId: 7,
    }),
  );
  const joining = systemCall.answer(store, store.getState().calls.calls[0]);
  await new Promise(resolve => setTimeout(resolve, 0));
  expect(request).toHaveBeenCalled();
  expect(twilioConnect).not.toHaveBeenCalled();
  await systemCall.end(store, store.getState().calls.calls[0]);
  expect(twilioDisconnect).toHaveBeenCalled();
  allow(RESULTS.GRANTED);
  await new Promise(resolve => setTimeout(resolve, 0));
  const startedAfterEnd = (twilioConnect as jest.Mock).mock.calls.length;
  if (connected) connected();
  await joining;
  await new Promise(resolve => setTimeout(resolve, 0));
  jest.restoreAllMocks();
  expect(startedAfterEnd).toBe(0);
});
