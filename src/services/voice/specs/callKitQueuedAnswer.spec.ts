import { configureStore } from '@reduxjs/toolkit';
import { Platform } from 'react-native';
import reducer, { addCall, setIsJoining } from '@/store/call/callSlice';
import { systemCall } from '../systemCall';
import { CallService } from '@/store/call/callService';
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
    terminateWhatsappCall: jest.fn(async () => ({})),
    rejectWhatsappCall: jest.fn(async () => ({})),
  },
}));

beforeEach(() => {
  jest.replaceProperty(Platform, 'OS', 'ios');
  jest.clearAllMocks();
});
afterEach(() => jest.restoreAllMocks());

const build = () =>
  configureStore({
    reducer: {
      calls: reducer,
      auth: (s = { user: { id: 1, account_id: 1, accounts: [] } }) => s,
    },
  });

const attach = (store: ReturnType<typeof build>) => {
  const detach = systemCall.attach(store as never);
  const listener = (native!.addListener as jest.Mock).mock.calls.find(
    ([name]) => name === 'onCallKitAction',
  )[1];
  return { detach, listener };
};

const flush = () => new Promise(resolve => setImmediate(resolve));

test('an end made while a CallKit answer waits for another join cancels that answer', async () => {
  const store = build();
  store.dispatch(
    addCall({
      callSid: 'waiting',
      provider: 'twilio',
      callDirection: 'inbound',
      inboxId: 3,
      conversationId: 7,
      systemUuid: 'uuid',
    }),
  );
  // Another call is joining, so the answer below is queued behind it
  store.dispatch(setIsJoining(true));
  // The decline the end sends is still in flight when the other join finishes
  let finishLeave: (value: unknown) => void = () => {};
  (CallService.leaveConference as jest.Mock).mockImplementationOnce(
    () => new Promise(resolve => (finishLeave = resolve)),
  );
  const { detach, listener } = attach(store);

  listener({ type: 'answer', uuid: 'uuid', callSid: 'waiting' });
  listener({ type: 'end', uuid: 'uuid', callSid: 'waiting', answered: true, provider: 'twilio' });
  await flush();
  store.dispatch(setIsJoining(false));
  await flush();
  await flush();
  finishLeave({});
  await flush();

  expect(native!.twilioConnect).not.toHaveBeenCalled();
  expect(CallService.joinConference).not.toHaveBeenCalled();
  expect(CallService.leaveConference).toHaveBeenCalledWith(
    expect.objectContaining({ callSid: 'waiting', inboxId: 3, conversationId: 7 }),
  );
  expect(store.getState().calls.calls).toEqual([]);
  detach();
});

test('ending a placed WhatsApp call on CallKit after the app lost it ends it on the server', async () => {
  const { detach, listener } = attach(build());
  listener({
    type: 'end',
    uuid: 'uuid',
    callSid: 'wacid.1',
    answered: false,
    outgoing: true,
    provider: 'whatsapp',
    callId: 9,
    accountId: 2,
  });
  await flush();
  expect(CallService.terminateWhatsappCall).toHaveBeenCalledWith(9, 2);
  expect(CallService.rejectWhatsappCall).not.toHaveBeenCalled();
  detach();
});

test('ending a placed Twilio call on CallKit after the app lost it leaves the conference', async () => {
  const { detach, listener } = attach(build());
  listener({
    type: 'end',
    uuid: 'uuid',
    callSid: 'CA1',
    answered: false,
    outgoing: true,
    provider: 'twilio',
    inboxId: 3,
    conversationId: 7,
    accountId: 2,
  });
  await flush();
  expect(CallService.leaveConference).toHaveBeenCalledWith({
    inboxId: 3,
    conversationId: 7,
    callSid: 'CA1',
    accountId: 2,
  });
  detach();
});
