import { configureStore } from '@reduxjs/toolkit';
import { mediaDevices } from 'react-native-webrtc';
import { webrtcEngine } from '@/services/voice/webrtcEngine';
import reducer, { addCall } from '../callSlice';
import { callActions } from '../callActions';
import { CallService } from '../callService';

jest.mock('expo-crypto', () => ({
  CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
  digestStringAsync: jest.fn(async (_algorithm: string, value: string) => `sha256:${value}`),
}));
jest.mock('react-native-incall-manager', () => ({
  default: { setForceSpeakerphoneOn: jest.fn(), start: jest.fn(), stop: jest.fn() },
}));
jest.mock('../callService', () => ({
  CallService: {
    getWhatsappCall: jest.fn(async () => ({ sdp_offer: 'v=0 offer' })),
    acceptWhatsappCall: jest.fn(),
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

test.each(['hold', 'mute'])(
  'a new inbound call does not inherit %s from an answer that lost the accept race',
  async choice => {
    const store = build();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dispatch = store.dispatch as any;
    let rejectAccept!: (error: unknown) => void;
    (CallService.acceptWhatsappCall as jest.Mock).mockImplementationOnce(
      () =>
        new Promise((_, reject) => {
          rejectAccept = reject;
        }),
    );
    store.dispatch(
      addCall({
        callSid: 'failed-A',
        callId: 1,
        provider: 'whatsapp',
        callDirection: 'inbound',
        sdpOffer: 'v=0 offer',
      }),
    );
    const first = dispatch(callActions.joinCall('failed-A')).unwrap();
    await flush();
    await dispatch(
      choice === 'hold' ? callActions.setHold(true) : callActions.toggleMute(),
    ).unwrap();
    rejectAccept({ response: { status: 409, data: { error: 'Call already accepted' } } });
    expect(await first).toEqual({ status: 'answered_elsewhere' });
    expect(store.getState().calls.calls).toEqual([]);
    expect(store.getState().calls.localCallSid).toBeNull();
    expect(store.getState().calls.isJoining).toBe(false);

    (CallService.acceptWhatsappCall as jest.Mock).mockResolvedValueOnce({});
    store.dispatch(
      addCall({
        callSid: 'new-B',
        callId: 2,
        provider: 'whatsapp',
        callDirection: 'inbound',
        sdpOffer: 'v=0 offer',
      }),
    );
    expect(await dispatch(callActions.joinCall('new-B')).unwrap()).toEqual({ status: 'joined' });
    const results = (mediaDevices.getUserMedia as jest.Mock).mock.results;
    const newStream = await results[results.length - 1].value;
    expect(newStream.getAudioTracks()[0].enabled).toBe(true);
    expect(store.getState().calls[choice === 'hold' ? 'isOnHold' : 'isMuted']).toBe(false);
  },
);
