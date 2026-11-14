import { store } from '@/store';
import { callActions } from '@/store/call/callActions';
import { applyPendingCallAction, attachCallSessionCore } from '../callSessionCore';
import {
  addCall,
  clearLocalCall,
  markLocalCall,
  setCallActive,
  removeCall,
  setAudioRoute,
} from '@/store/call/callSlice';
import { takePendingCallAction } from '@/utils/callNotifications';
import { CallService } from '@/store/call/callService';
import {
  addAudioRouteListener,
  addNativeCallActionListener,
  addTelecomUnavailableListener,
  queueNativeEnd,
  rememberNativeCall,
  startOngoingCallNotification,
  reportNativeCallState,
  stopOngoingCallNotification,
} from '@/services/voice/chatwootCalls';
import { setMicrophoneGrantedHandler, webrtcEngine } from '../webrtcEngine';

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
  hasNativeAudioRouting: jest.fn(() => true),
  addAudioRouteListener: jest.fn(() => ({ remove() {} })),
  addNativeCallActionListener: jest.fn(() => ({ remove() {} })),
  addTwilioCallStateListener: jest.fn(() => ({ remove() {} })),
  addTelecomUnavailableListener: jest.fn(() => ({ remove() {} })),
  getAudioRoute: jest.fn(() => ({ current: 'unknown', available: [] })),
  reportNativeCallState: jest.fn(),
  startOngoingCallNotification: jest.fn(),
  stopOngoingCallNotification: jest.fn(),
  rememberNativeCall: jest.fn(),
  setNativeSignedIn: jest.fn(),
  queueNativeEnd: jest.fn(),
  endRingingNativeCall: jest.fn(),
  isSystemCallUiAvailable: jest.fn(() => false),
}));
jest.mock('@/services/voice/callEngine', () => ({ callEngine: {} }));
jest.mock('@/services/voice/webrtcEngine', () => ({
  webrtcEngine: { ensureAudioRoute: jest.fn() },
  setWebrtcConnectionLostHandler: jest.fn(),
  setMicrophoneGrantedHandler: jest.fn(),
}));
jest.mock('@/store/call/callService', () => ({
  CallService: {
    terminateWhatsappCall: jest.fn(async () => ({})),
    leaveConference: jest.fn(async () => ({})),
  },
}));

beforeEach(() => jest.clearAllMocks());

test('an answered inbound call is carried as an ongoing call while it connects', () => {
  const detach = attachCallSessionCore();
  try {
    store.dispatch(
      addCall({ callSid: 'answering', provider: 'whatsapp', callDirection: 'inbound' }),
    );
    expect(startOngoingCallNotification).not.toHaveBeenCalled();

    store.dispatch(markLocalCall('answering'));
    expect(startOngoingCallNotification).toHaveBeenCalledTimes(1);
    expect(startOngoingCallNotification).toHaveBeenLastCalledWith(
      'answering',
      'Caller',
      '123',
      'Inbox',
      '',
      'active',
    );

    store.dispatch(setCallActive('answering'));
    expect(startOngoingCallNotification).toHaveBeenCalledTimes(2);

    store.dispatch(removeCall('answering'));
    expect(stopOngoingCallNotification).toHaveBeenCalledWith('answering', 'remote');
  } finally {
    detach();
    store.dispatch(clearLocalCall('answering'));
  }
});

test('the ongoing call starts again once the microphone is granted during the answer', () => {
  const detach = attachCallSessionCore();
  try {
    store.dispatch(
      addCall({ callSid: 'granting', provider: 'whatsapp', callDirection: 'inbound' }),
    );
    store.dispatch(markLocalCall('granting'));
    expect(startOngoingCallNotification).toHaveBeenCalledTimes(1);

    const granted = (setMicrophoneGrantedHandler as jest.Mock).mock.calls.at(-1)[0];
    granted();

    expect(startOngoingCallNotification).toHaveBeenCalledTimes(2);
    expect(startOngoingCallNotification).toHaveBeenLastCalledWith(
      'granting',
      'Caller',
      '123',
      'Inbox',
      '',
      'active',
    );
  } finally {
    detach();
    store.dispatch(clearLocalCall('granting'));
    store.dispatch(removeCall('granting'));
  }
});

test('an inbound call whose answer fails is no longer carried', () => {
  const detach = attachCallSessionCore();
  try {
    store.dispatch(addCall({ callSid: 'failing', provider: 'whatsapp', callDirection: 'inbound' }));
    store.dispatch(markLocalCall('failing'));
    store.dispatch(clearLocalCall('failing'));

    expect(stopOngoingCallNotification).toHaveBeenCalledWith('failing', 'remote');
  } finally {
    detach();
    store.dispatch(removeCall('failing'));
  }
});

test('a Telecom hold for a call this device no longer carries is left alone', () => {
  const detach = attachCallSessionCore();
  try {
    store.dispatch(addCall({ callSid: 'current', provider: 'twilio', callDirection: 'inbound' }));
    store.dispatch(markLocalCall('current'));
    const listener = (addNativeCallActionListener as jest.Mock).mock.calls.at(-1)[0];

    const setHold = jest.spyOn(callActions, 'setHold');

    listener({ action: 'hold', enabled: true, callSid: 'earlier' });
    expect(setHold).not.toHaveBeenCalled();

    listener({ action: 'hold', enabled: true, callSid: 'current' });
    expect(setHold).toHaveBeenCalledWith(true);
    setHold.mockRestore();
  } finally {
    detach();
    store.dispatch(clearLocalCall('current'));
    store.dispatch(removeCall('current'));
  }
});

test('route reports from an ended call cannot overwrite the current call', () => {
  const detach = attachCallSessionCore();
  store.dispatch(
    addCall({ callSid: 'audio-current', provider: 'whatsapp', callDirection: 'outbound' }),
  );
  store.dispatch(markLocalCall('audio-current'));
  store.dispatch(setCallActive('audio-current'));
  const listener = (addAudioRouteListener as jest.Mock).mock.calls[0][0];
  try {
    listener({ callSid: 'audio-current', current: 'speaker', available: ['speaker', 'earpiece'] });
    expect(store.getState().calls.audioRoute.current).toBe('speaker');
    listener({
      callSid: 'audio-ended',
      current: 'bluetooth',
      available: ['bluetooth', 'earpiece'],
    });
    expect(store.getState().calls.audioRoute.current).toBe('speaker');
    expect(store.getState().calls.audioRoute.available).toEqual(['speaker', 'earpiece']);
  } finally {
    store.dispatch(removeCall('audio-current'));
    store.dispatch(clearLocalCall('audio-current'));
    store.dispatch(setAudioRoute({ current: 'earpiece', available: ['earpiece', 'speaker'] }));
    detach();
  }
});

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
  listener({ callSid: 'other-incoming-call' });
  expect(webrtcEngine.ensureAudioRoute).not.toHaveBeenCalled();
  listener({ callSid: 'incoming' });
  expect(webrtcEngine.ensureAudioRoute).toHaveBeenCalledWith(false);
  detach();
});
