import { configureStore } from '@reduxjs/toolkit';
import native from '../../../../modules/chatwoot-calls/src/ChatwootCallsModule';
import reducer, { addCall, markLocalCall } from '../callSlice';
import { callActions } from '../callActions';
import { CallService } from '../callService';

jest.mock('react-native-device-info', () => ({ isEmulatorSync: () => false }));
jest.mock('react-native-incall-manager', () => ({
  default: { setForceSpeakerphoneOn: jest.fn(), start: jest.fn(), stop: jest.fn() },
}));
jest.mock('../../../../modules/chatwoot-calls/src/ChatwootCallsModule', () => ({
  __esModule: true,
  default: {
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    stopRingback: jest.fn(),
    startRingback: jest.fn(),
    setSpeakerOn: jest.fn(),
  },
}));
jest.mock('../callService', () => ({
  CallService: { terminateWhatsappCall: jest.fn(), getRingingCalls: jest.fn() },
}));

test('ending a ringing WhatsApp call stops the ringback before the server answers', async () => {
  const store = configureStore({
    reducer: { calls: reducer, auth: (s = { user: { id: 1, account_id: 1, accounts: [] } }) => s },
  });
  store.dispatch(markLocalCall('wacid.1'));
  store.dispatch(
    addCall({
      callSid: 'wacid.1',
      callId: 9,
      provider: 'whatsapp',
      callDirection: 'outbound',
      conversationId: 37,
      inboxId: 3,
    }),
  );
  let finishTerminate: (value: unknown) => void = () => {};
  (CallService.terminateWhatsappCall as jest.Mock).mockImplementationOnce(
    () => new Promise(resolve => (finishTerminate = resolve)),
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ending = (store.dispatch as any)(callActions.rejectIncomingCall('wacid.1'));
  await new Promise(resolve => setTimeout(resolve, 0));

  expect(CallService.terminateWhatsappCall).toHaveBeenCalled();
  expect(native!.stopRingback).toHaveBeenCalled();
  finishTerminate({});
  await ending;
});
