import { Platform } from 'react-native';
import { store } from '@/store';
import { webrtcEngine } from '../webrtcEngine';
import { attachCallSessionCore } from '../callSessionCore';
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
    initiateWhatsappCall: jest.fn(),
    getWhatsappCall: jest.fn(),
    rejectWhatsappCall: jest.fn(async () => ({})),
    terminateWhatsappCall: jest.fn(async () => ({})),
  },
}));

test('automatic logout cancels an outbound placement awaiting the provider response', async () => {
  jest.replaceProperty(Platform, 'OS', 'android');
  const detach = attachCallSessionCore();
  let started!: (value: unknown) => void;
  (CallService.initiateWhatsappCall as jest.Mock).mockImplementationOnce(
    () =>
      new Promise(resolve => {
        started = resolve;
      }),
  );
  const placing = store
    .dispatch(
      callActions.startOutboundCall({ provider: 'whatsapp', conversationId: 7, inboxId: 3 }),
    )
    .unwrap();
  await new Promise(resolve => setTimeout(resolve, 0));
  expect(CallService.initiateWhatsappCall).toHaveBeenCalled();
  store.dispatch({ type: 'auth/logout' });
  detach();
  await new Promise(resolve => setTimeout(resolve, 0));
  started({ status: 'calling', id: 10, call_id: 'late-outbound', conversation_id: 7 });
  const result = await placing;
  const callsAfterLogout = store.getState().calls.calls;
  await webrtcEngine.hangup();
  jest.restoreAllMocks();
  expect(callsAfterLogout).toEqual([]);
  expect(result.status).toBe('cancelled');
});
