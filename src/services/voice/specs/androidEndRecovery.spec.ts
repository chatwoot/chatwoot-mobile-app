import { store } from '@/store';
import { applyPendingCallAction, attachCallSessionCore } from '../callSessionCore';
import { addCall, markLocalCall, setCallActive, removeCall } from '@/store/call/callSlice';
import { takePendingCallAction } from '@/utils/callNotifications';
import { CallService } from '@/store/call/callService';
import {
  addNativeCallActionListener,
  addTelecomUnavailableListener,
  queueNativeEnd,
  rememberNativeCall,
  startOngoingCallNotification,
  reportNativeCallState,
  stopOngoingCallNotification,
} from '@/services/voice/chatwootCalls';
import { webrtcEngine } from '../webrtcEngine';

jest.mock('@/store', () => {
  /* eslint-disable @typescript-eslint/no-require-imports */
  const { configureStore } = require('@reduxjs/toolkit');
  const reducer = require('@/store/call/callSlice').default;
  /* eslint-enable @typescript-eslint/no-require-imports */
  return {
    store: configureStore({
      reducer: {
        calls: reducer,
        auth: (state = { user: { id: 1, account_id: 1, accounts: [] } }) => state,
      },
    }),
  };
});
jest.mock('../systemCall', () => ({
  callerInfo: () => ({ name: 'Caller', handle: '123', inboxName: 'Inbox', avatar: '' }),
  systemCall: {},
}));
jest.mock('@/utils/callNotifications', () => ({ takePendingCallAction: jest.fn() }));
jest.mock('@/utils/voiceCallFeedback', () => ({ reportAnswerFailure: jest.fn() }));
jest.mock('@/services/voice/chatwootCalls', () => ({
  isTelecomAvailable: jest.fn(() => true),
  addAudioRouteListener: jest.fn(() => ({ remove() {} })),
  addNativeCallActionListener: jest.fn(() => ({ remove() {} })),
  addTwilioCallStateListener: jest.fn(() => ({ remove() {} })),
  addTelecomUnavailableListener: jest.fn(() => ({ remove() {} })),
  getAudioRoute: jest.fn(() => ({ current: 'unknown', available: [] })),
  reportNativeCallState: jest.fn(),
  startOngoingCallNotification: jest.fn(),
  stopOngoingCallNotification: jest.fn(),
  rememberNativeCall: jest.fn(),
  queueNativeEnd: jest.fn(),
  endRingingNativeCall: jest.fn(),
  isSystemCallUiAvailable: jest.fn(() => false),
}));
jest.mock('@/services/voice/callEngine', () => ({ callEngine: {} }));
jest.mock('@/services/voice/webrtcEngine', () => ({
  webrtcEngine: { ensureAudioRoute: jest.fn() },
  setWebrtcConnectionLostHandler: jest.fn(),
}));
jest.mock('@/store/call/callService', () => ({
  CallService: {
    terminateWhatsappCall: jest.fn(async () => ({})),
    leaveConference: jest.fn(async () => ({})),
  },
}));

beforeEach(() => jest.clearAllMocks());

test('a kept end with no call details has nothing to tell the server and only closes the native screen', async () => {
  const detach = attachCallSessionCore();
  (takePendingCallAction as jest.Mock)
    .mockReturnValueOnce({ action: 'end', callSid: 'outbound' })
    .mockReturnValue(null);
  await applyPendingCallAction();
  expect(CallService.terminateWhatsappCall).not.toHaveBeenCalled();
  expect(CallService.leaveConference).not.toHaveBeenCalled();
  expect(reportNativeCallState).toHaveBeenCalledWith('ended', 'outbound');
  detach();
});

test('a kept end with call details ends the call with the server and clears the native call', async () => {
  const detach = attachCallSessionCore();
  (takePendingCallAction as jest.Mock)
    .mockReturnValueOnce({
      action: 'end',
      callSid: 'background',
      provider: 'whatsapp',
      callId: 42,
      accountId: 1,
    })
    .mockReturnValue(null);
  await applyPendingCallAction();
  expect(CallService.terminateWhatsappCall).toHaveBeenCalledWith(42, 1);
  expect(reportNativeCallState).toHaveBeenCalledWith('ended', 'background');
  expect(stopOngoingCallNotification).toHaveBeenCalledWith('background', 'local');
  detach();
});

test('an end for a call the reloaded app no longer has is recovered from the native details', async () => {
  const detach = attachCallSessionCore();
  // The native side keeps the end with the details it remembered for the call
  (queueNativeEnd as jest.Mock).mockImplementationOnce(() =>
    (takePendingCallAction as jest.Mock).mockReturnValueOnce({
      action: 'end',
      callSid: 'orphan',
      provider: 'whatsapp',
      callId: 42,
      accountId: 1,
    }),
  );
  const listener = (addNativeCallActionListener as jest.Mock).mock.calls[0][0];
  listener({ action: 'end', callSid: 'orphan' });
  await applyPendingCallAction();
  expect(queueNativeEnd).toHaveBeenCalledWith('orphan');
  expect(CallService.terminateWhatsappCall).toHaveBeenCalledWith(42, 1);
  expect(stopOngoingCallNotification).toHaveBeenCalledWith('orphan', 'local');
  detach();
});

test("an old end replayed after a newer call started asks native to stop only the old call's service", async () => {
  const detach = attachCallSessionCore();
  let finishOld!: () => void;
  (CallService.terminateWhatsappCall as jest.Mock).mockImplementationOnce(
    () =>
      new Promise(resolve => {
        finishOld = () => resolve({});
      }),
  );
  (takePendingCallAction as jest.Mock)
    .mockReturnValueOnce({
      action: 'end',
      callSid: 'old',
      provider: 'whatsapp',
      callId: 99,
      accountId: 1,
    })
    .mockReturnValue(null);
  const replay = applyPendingCallAction();
  await Promise.resolve();
  await Promise.resolve();
  store.dispatch(
    addCall({
      callSid: 'new',
      callId: 100,
      provider: 'whatsapp',
      callDirection: 'outbound',
      accountId: 1,
    }),
  );
  store.dispatch(markLocalCall('new'));
  expect(rememberNativeCall).toHaveBeenCalledWith(
    'new',
    expect.objectContaining({ callId: 100, accountId: 1, provider: 'whatsapp' }),
  );
  expect(startOngoingCallNotification).toHaveBeenCalledWith(
    'new',
    expect.any(String),
    expect.any(String),
    expect.any(String),
    expect.any(String),
    'calling',
  );
  finishOld();
  await replay;
  expect(stopOngoingCallNotification).toHaveBeenCalledWith('old', 'local');
  expect((stopOngoingCallNotification as jest.Mock).mock.invocationCallOrder[0]).toBeGreaterThan(
    (startOngoingCallNotification as jest.Mock).mock.invocationCallOrder[0],
  );
  expect(store.getState().calls.calls.some(call => call.callSid === 'new')).toBe(true);
  detach();
  store.dispatch(removeCall('new'));
  store.dispatch(markLocalCall(null));
});

test('a Telecom failure after the call is live starts the fallback audio', () => {
  const detach = attachCallSessionCore();
  store.dispatch(
    addCall({ callSid: 'incoming', callId: 1, provider: 'whatsapp', callDirection: 'inbound' }),
  );
  store.dispatch(markLocalCall('incoming'));
  store.dispatch(setCallActive('incoming'));
  expect(webrtcEngine.ensureAudioRoute).not.toHaveBeenCalled();
  const listener = (addTelecomUnavailableListener as jest.Mock).mock.calls[0][0];
  listener({ callSid: 'incoming' });
  expect(webrtcEngine.ensureAudioRoute).toHaveBeenCalledWith(false);
  detach();
});
