import { mediaDevices } from 'react-native-webrtc';
import { Platform } from 'react-native';
import { store } from '@/store';
import { systemCall } from '../systemCall';
import { webrtcEngine } from '../webrtcEngine';
import { attachCallSessionCore } from '../callSessionCore';
import { addCall } from '@/store/call/callSlice';
import { CallService } from '@/store/call/callService';

jest.mock('@/store', () => {
  /* eslint-disable @typescript-eslint/no-require-imports */
  const { configureStore, combineReducers } = require('@reduxjs/toolkit');
  const calls = require('@/store/call/callSlice').default;
  /* eslint-enable @typescript-eslint/no-require-imports */
  const appReducer = combineReducers({ calls, auth: (state = { user: null }) => state });
  const reducer = (state: ReturnType<typeof appReducer> | undefined, action: { type: string }) =>
    action.type === 'auth/logout'
      ? appReducer(undefined, { type: 'INIT' })
      : appReducer(state, action);
  return {
    store: configureStore({
      reducer,
      preloadedState: {
        calls: calls(undefined, { type: 'INIT' }),
        auth: { user: { id: 1, account_id: 1, accounts: [] } },
      },
    }),
  };
});
jest.mock('react-native-incall-manager', () => ({
  default: { setForceSpeakerphoneOn: jest.fn(), start: jest.fn(), stop: jest.fn() },
}));
jest.mock('@/store/call/callService', () => ({
  CallService: {
    acceptWhatsappCall: jest.fn(),
    getWhatsappCall: jest.fn(),
    rejectWhatsappCall: jest.fn(async () => ({})),
    terminateWhatsappCall: jest.fn(async () => ({})),
  },
}));

test('automatic logout before the offer response must prevent opening a later microphone', async () => {
  jest.replaceProperty(Platform, 'OS', 'android');
  const detach = attachCallSessionCore();
  let details!: (value: unknown) => void;
  let accepted!: (value: unknown) => void;
  (CallService.getWhatsappCall as jest.Mock).mockImplementationOnce(
    () =>
      new Promise(resolve => {
        details = resolve;
      }),
  );
  (CallService.acceptWhatsappCall as jest.Mock).mockImplementationOnce(
    () =>
      new Promise(resolve => {
        accepted = resolve;
      }),
  );
  store.dispatch(
    addCall({
      callSid: 'end-before-media',
      callId: 1,
      provider: 'whatsapp',
      callDirection: 'inbound',
    }),
  );
  const joining = systemCall.answer(store, store.getState().calls.calls[0]);
  await new Promise(resolve => setTimeout(resolve, 0));
  expect(mediaDevices.getUserMedia).not.toHaveBeenCalled();
  store.dispatch({ type: 'auth/logout' });
  details({ sdp_offer: 'v=0 offer' });
  await new Promise(resolve => setTimeout(resolve, 0));
  const results = (mediaDevices.getUserMedia as jest.Mock).mock.results;
  const stream = results.length ? await results[results.length - 1].value : undefined;
  const reopenedAfterEnd =
    !!stream &&
    stream.getAudioTracks()[0].enabled &&
    stream.getTracks()[0].stop.mock.calls.length === 0;
  if (accepted) accepted({});
  await joining;
  await new Promise(resolve => setTimeout(resolve, 0));
  detach();
  await webrtcEngine.hangup();
  await new Promise(resolve => setTimeout(resolve, 850));
  jest.restoreAllMocks();
  expect(reopenedAfterEnd).toBe(false);
});
