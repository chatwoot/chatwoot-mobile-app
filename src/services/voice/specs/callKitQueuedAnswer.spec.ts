import { configureStore } from '@reduxjs/toolkit';
import { Platform } from 'react-native';
import reducer, { addCall, markLocalCall, setIsJoining } from '@/store/call/callSlice';
import { systemCall } from '../systemCall';
import { pendingJoin, trackJoin } from '../pendingJoins';
import { CallService } from '@/store/call/callService';
import native from '../../../../modules/chatwoot-calls/src/ChatwootCallsModule';

jest.mock('react-native-device-info', () => ({ isEmulatorSync: () => false }));
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
  store.dispatch(setIsJoining(true));
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

test('a CallKit end for a call the app lost leaves another live call alone', async () => {
  const store = build();
  store.dispatch(
    addCall({
      callSid: 'wacid.live',
      callId: 20,
      provider: 'whatsapp',
      callDirection: 'inbound',
      accountId: 1,
      isActive: true,
    }),
  );
  const { detach, listener } = attach(store);
  listener({
    type: 'end',
    uuid: 'old-uuid',
    callSid: 'wacid.lost',
    answered: true,
    provider: 'whatsapp',
    callId: 10,
    accountId: 1,
  });
  await flush();
  expect(CallService.terminateWhatsappCall).toHaveBeenCalledWith(10, 1);
  expect(CallService.terminateWhatsappCall).not.toHaveBeenCalledWith(20, 1);
  expect(store.getState().calls.calls.map(call => call.callSid)).toEqual(['wacid.live']);
  detach();
});

test('a CallKit mute or hold for another call leaves the call this device carries alone', async () => {
  const store = build();
  store.dispatch(
    addCall({
      callSid: 'new',
      provider: 'whatsapp',
      callDirection: 'inbound',
      systemUuid: 'uuid-new',
    }),
  );
  store.dispatch(markLocalCall('new'));
  const { detach, listener } = attach(store);

  listener({ type: 'hold', uuid: 'uuid-old', callSid: 'old', onHold: true });
  listener({ type: 'mute', uuid: 'uuid-old', callSid: 'old', muted: true });
  await flush();

  expect(store.getState().calls.isOnHold).toBe(false);
  expect(store.getState().calls.isMuted).toBe(false);

  listener({ type: 'mute', uuid: 'uuid-new', callSid: 'new', muted: true });
  await flush();
  expect(store.getState().calls.isMuted).toBe(true);
  detach();
});

test('an answer CallKit replays for a call already being joined shares that join', async () => {
  const store = build();
  store.dispatch(
    addCall({
      callSid: 'cold',
      provider: 'twilio',
      callDirection: 'inbound',
      inboxId: 3,
      conversationId: 7,
      systemUuid: 'uuid-cold',
    }),
  );
  const adopted = trackJoin('cold', new Promise(() => {}));
  const { detach, listener } = attach(store);

  listener({ type: 'answer', uuid: 'uuid-cold', callSid: 'cold' });
  await flush();

  expect(pendingJoin('cold')).toBe(adopted);
  expect(CallService.joinConference).not.toHaveBeenCalled();
  detach();
});

test('a second answer for a call still being joined shares the first join', async () => {
  jest.replaceProperty(Platform, 'OS', 'android');
  const store = build();
  store.dispatch(
    addCall({
      callSid: 'tapped',
      provider: 'twilio',
      callDirection: 'inbound',
      inboxId: 3,
      conversationId: 7,
    }),
  );
  let failToken: (error: Error) => void = () => {};
  (CallService.getConferenceToken as jest.Mock).mockImplementationOnce(
    () => new Promise((_, reject) => (failToken = reject)),
  );
  const call = store.getState().calls.calls[0];

  const first = systemCall.answer(store as never, call);
  await flush();
  const tracked = pendingJoin('tapped');
  const second = systemCall.answer(store as never, call);
  await flush();

  expect(tracked).toBeDefined();
  expect(pendingJoin('tapped')).toBe(tracked);
  expect(CallService.getConferenceToken).toHaveBeenCalledTimes(1);
  failToken(new Error('offline'));
  const outcomes = await Promise.allSettled([first, second]);
  expect(outcomes[1]).toEqual(outcomes[0]);
});
