import { mediaDevices } from 'react-native-webrtc';
import { Platform } from 'react-native';
import { store } from '@/store';
import { systemCall } from '../systemCall';
import { webrtcEngine } from '../webrtcEngine';
import { attachCallSessionCore } from '../callSessionCore';
import { addCall } from '@/store/call/callSlice';
import { CallService } from '@/store/call/callService';
import { callActions } from '@/store/call/callActions';

jest.mock('@/store', () => {
  /* eslint-disable @typescript-eslint/no-require-imports */
  const { configureStore, combineReducers } = require('@reduxjs/toolkit');
  const calls = require('@/store/call/callSlice').default;
  const appReducer = combineReducers({
    calls,
    conversations: require('@/store/conversation/conversationSlice').default,
    inboxes: require('@/store/inbox/inboxSlice').default,
    auth: (state = { user: null }) => state,
  });
  /* eslint-enable @typescript-eslint/no-require-imports */
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

test('explicit session teardown releases an open microphone before pending acceptance responds', async () => {
  jest.replaceProperty(Platform, 'OS', 'android');
  const detach = attachCallSessionCore();
  let accepted!: (value: unknown) => void;
  (CallService.acceptWhatsappCall as jest.Mock).mockImplementationOnce(
    () =>
      new Promise(resolve => {
        accepted = resolve;
      }),
  );
  store.dispatch(
    addCall({
      callSid: 'joining',
      callId: 10,
      provider: 'whatsapp',
      callDirection: 'inbound',
      sdpOffer: 'v=0 offer',
    }),
  );
  const joining = systemCall.answer(store, store.getState().calls.calls[0]);
  await new Promise(resolve => setTimeout(resolve, 0));
  expect(CallService.acceptWhatsappCall).toHaveBeenCalled();
  const stream = await (mediaDevices.getUserMedia as jest.Mock).mock.results.slice(-1)[0].value;
  const closing = store.dispatch(callActions.endLocalCalls()).unwrap();
  await new Promise(resolve => setTimeout(resolve, 0));
  const stoppedBeforeAccept = stream.getTracks()[0].stop.mock.calls.length > 0;
  accepted({});
  await joining;
  await closing;
  detach();
  await webrtcEngine.hangup();
  await new Promise(resolve => setTimeout(resolve, 850));
  jest.restoreAllMocks();
  expect(stoppedBeforeAccept).toBe(true);
});
