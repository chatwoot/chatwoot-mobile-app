import { configureStore } from '@reduxjs/toolkit';
import { callEngine } from '@/services/voice/callEngine';
import actionCableConnector from '@/utils/actionCable';
import { callTimerStart } from '@/utils/voiceCallUtils';
import reducer, { addCall, markLocalCall } from '../callSlice';
import { callActions } from '../callActions';
import { CallService } from '../callService';

let mockStore: ReturnType<typeof build>;
jest.mock('@/store', () => ({
  get store() {
    return mockStore;
  },
}));
jest.mock('@/utils/baseActionCableConnector', () => ({
  __esModule: true,
  default: class {
    disconnect() {}
  },
}));
jest.mock('@/services/voice/systemCall', () => ({
  systemCall: { endedBySid: jest.fn() },
  systemEndReason: jest.fn(() => 'remote'),
}));
jest.mock('react-native-incall-manager', () => ({
  default: { setForceSpeakerphoneOn: jest.fn(), start: jest.fn(), stop: jest.fn() },
}));
jest.mock('../callService', () => ({
  CallService: {
    startContactCall: jest.fn(),
    getConferenceToken: jest.fn(async () => ({ token: 'jwt' })),
    joinConference: jest.fn(async () => ({ conference_sid: 'conf_1' })),
    leaveConference: jest.fn(async () => ({})),
    terminateWhatsappCall: jest.fn(async () => ({})),
    getRingingCalls: jest.fn(),
  },
}));

const build = () =>
  configureStore({
    reducer: {
      calls: reducer,
      auth: (
        state = { user: { id: 1, account_id: 1, accounts: [{ id: 1, availability: 'online' }] } },
      ) => state,
    },
  });
const flush = () => new Promise(resolve => setTimeout(resolve, 0));
const connect = () =>
  actionCableConnector.init({
    pubSubToken: 'test',
    webSocketUrl: 'wss://example.invalid',
    accountId: 1,
    userId: 1,
  });

beforeEach(() => jest.clearAllMocks());

test('a Twilio answer that arrives before the dial response still starts the timer', async () => {
  mockStore = build();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dispatch = mockStore.dispatch as any;
  const twilioConnect = jest.spyOn(callEngine.twilio, 'connect').mockResolvedValue(undefined);
  let finishDial!: (value: unknown) => void;
  (CallService.startContactCall as jest.Mock).mockImplementationOnce(
    () => new Promise(resolve => (finishDial = resolve)),
  );
  const placing = dispatch(
    callActions.startOutboundCall({
      provider: 'twilio',
      conversationId: 37,
      inboxId: 3,
      contactId: 55,
    }),
  ).unwrap();
  await flush();

  connect().onMessageUpdated({
    id: 10,
    content_type: 'voice_call',
    conversation_id: 37,
    inbox_id: 3,
    call: {
      id: 5,
      provider: 'twilio',
      provider_call_id: 'CA1',
      direction: 'outgoing',
      status: 'in_progress',
      provider_status: 'in-progress',
    },
  } as never);
  finishDial({ call_sid: 'CA1', conversation_id: 37 });
  await placing;

  const call = mockStore.getState().calls.calls[0];
  expect(call.providerStatus).toBe('in-progress');
  expect(callTimerStart(call, call.activeSince)).toEqual(expect.any(Number));
  twilioConnect.mockRestore();
});

test('a WhatsApp answer that cannot be applied ends the placed call', async () => {
  mockStore = build();
  mockStore.dispatch(markLocalCall('wacid.1'));
  mockStore.dispatch(
    addCall({
      callSid: 'wacid.1',
      callId: 9,
      provider: 'whatsapp',
      callDirection: 'outbound',
      conversationId: 37,
      inboxId: 3,
    }),
  );
  jest.spyOn(callEngine.whatsapp, 'applyAnswer').mockRejectedValueOnce(new Error('bad sdp'));

  connect().onVoiceCallOutboundConnected({
    account_id: 1,
    id: 9,
    call_id: 'wacid.1',
    provider: 'whatsapp',
    status: 'ringing',
    sdp_answer: 'v=0 answer',
  } as never);
  await flush();
  await flush();

  expect(CallService.terminateWhatsappCall).toHaveBeenCalledWith(9, undefined);
  expect(mockStore.getState().calls.calls).toEqual([]);
});
