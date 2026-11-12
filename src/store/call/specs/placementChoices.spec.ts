import { configureStore } from '@reduxjs/toolkit';
import { MediaStream, mediaDevices } from 'react-native-webrtc';
import { webrtcEngine } from '@/services/voice/webrtcEngine';
import actionCableConnector from '@/utils/actionCable';
import reducer from '../callSlice';
import { callActions } from '../callActions';

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
jest.mock('expo-crypto', () => ({
  CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
  digestStringAsync: jest.fn(async (_algorithm: string, value: string) => `sha256:${value}`),
}));
jest.mock('react-native-incall-manager', () => ({
  default: { setForceSpeakerphoneOn: jest.fn(), start: jest.fn(), stop: jest.fn() },
}));
jest.mock('../callService', () => ({
  CallService: {
    initiateWhatsappCall: jest.fn(async () => ({
      status: 'calling',
      call_id: 'outbound-A',
      id: 1,
    })),
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
afterEach(async () => {
  await webrtcEngine.hangup();
});

test('an unrelated call ending preserves the mute displayed during outbound placement', async () => {
  mockStore = build();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dispatch = mockStore.dispatch as any;
  const stream = new MediaStream();
  let finishOpening!: () => void;
  (mediaDevices.getUserMedia as jest.Mock).mockImplementationOnce(
    () =>
      new Promise(resolve => {
        finishOpening = () => resolve(stream);
      }),
  );
  const placing = dispatch(
    callActions.startOutboundCall({ provider: 'whatsapp', conversationId: 37, inboxId: 7 }),
  ).unwrap();
  await flush();
  await dispatch(callActions.toggleMute()).unwrap();
  expect(mockStore.getState().calls.isMuted).toBe(true);
  const connector = actionCableConnector.init({
    pubSubToken: 'test',
    webSocketUrl: 'wss://example.invalid',
    accountId: 1,
    userId: 1,
  });
  connector.onVoiceCallEnded({
    account_id: 1,
    id: 2,
    call_id: 'unrelated-B',
    provider: 'whatsapp',
    status: 'completed',
  });
  finishOpening();
  expect(await placing).toEqual({ status: 'calling', callSid: 'outbound-A' });
  expect(stream.getAudioTracks()[0].enabled).toBe(false);
  expect(mockStore.getState().calls.isMuted).toBe(true);
});
