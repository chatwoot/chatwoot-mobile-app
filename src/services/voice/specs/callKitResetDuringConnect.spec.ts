import { configureStore } from '@reduxjs/toolkit';
import { Platform } from 'react-native';
import reducer, { addCall } from '@/store/call/callSlice';
import { systemCall } from '../systemCall';
import { CallService } from '@/store/call/callService';
import { isSessionClosing, pendingJoin } from '../pendingJoins';
import native from '../../../../modules/chatwoot-calls/src/ChatwootCallsModule';

jest.mock('react-native-device-info', () => ({ isEmulatorSync: () => false }));
jest.mock('../callSessionCore', () => ({ markLocalEnd: jest.fn() }));
jest.mock('../callerInfo', () => ({ selectCallerInfo: jest.fn() }));
jest.mock('@/utils/voiceCallFeedback', () => ({ reportAnswerFailure: jest.fn() }));
jest.mock('../webrtcEngine', () => ({
  ensureMicrophonePermission: jest.fn(async () => {}),
  webrtcEngine: { abandonOpening: jest.fn(), hangup: jest.fn(async () => {}) },
}));
jest.mock('../../../../modules/chatwoot-calls/src/ChatwootCallsModule', () => ({
  __esModule: true,
  default: {
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    twilioConnect: jest.fn(async () => {}),
    twilioDisconnect: jest.fn(),
    callKitReady: jest.fn(),
    callKitEndCall: jest.fn(),
  },
}));
jest.mock('@/store/call/callService', () => ({
  CallService: {
    getConferenceToken: jest.fn(async () => ({ token: 'token' })),
    joinConference: jest.fn(async () => ({ conference_sid: 'conference' })),
    leaveConference: jest.fn(async () => ({})),
  },
}));

beforeEach(() => {
  jest.useFakeTimers();
  jest.replaceProperty(Platform, 'OS', 'ios');
  jest.clearAllMocks();
});
afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

const connecting = async (sid: string) => {
  const store = configureStore({
    reducer: {
      calls: reducer,
      auth: (s = { user: { id: 1, account_id: 1, accounts: [] } }) => s,
    },
  });
  store.dispatch(
    addCall({
      callSid: sid,
      provider: 'twilio',
      callDirection: 'inbound',
      inboxId: 3,
      conversationId: 7,
      systemUuid: 'uuid',
    }),
  );
  const detach = systemCall.attach(store as never);
  const listener = (native!.addListener as jest.Mock).mock.calls.find(
    ([name]) => name === 'onCallKitAction',
  )[1];
  listener({ type: 'answer', uuid: 'uuid', callSid: sid });
  await jest.advanceTimersByTimeAsync(0);
  expect(native!.twilioConnect).toHaveBeenCalledTimes(1);
  expect(store.getState().calls.isJoining).toBe(true);
  return { store, listener, detach, join: pendingJoin(sid)! };
};

test('CallKit End settles the pending real connect without a terminal SDK callback', async () => {
  const { store, listener, detach, join } = await connecting('end');
  listener({ type: 'end', uuid: 'uuid', callSid: 'end', answered: true, provider: 'twilio' });
  await jest.advanceTimersByTimeAsync(0);
  await join;
  expect(store.getState().calls.isJoining).toBe(false);
  expect(CallService.leaveConference).toHaveBeenCalled();
  expect(jest.getTimerCount()).toBe(0);
  detach();
});

test('a CallKit reset settles the pending connect at once and leaves the conference', async () => {
  const { store, listener, detach, join } = await connecting('reset');
  // Native providerDidReset has already disconnected the call and removed its active reference.
  listener({ type: 'reset' });
  await jest.advanceTimersByTimeAsync(0);
  await join;
  await jest.advanceTimersByTimeAsync(0);
  expect(native!.twilioDisconnect).toHaveBeenCalled();
  expect(store.getState().calls.isJoining).toBe(false);
  expect(isSessionClosing()).toBe(false);
  expect(CallService.leaveConference).toHaveBeenCalledWith({
    inboxId: 3,
    conversationId: 7,
    callSid: 'reset',
    accountId: 1,
  });
  detach();
});
