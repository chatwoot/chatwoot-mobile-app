import { store } from '@/store';
import { applyPendingCallAction } from '../callSessionCore';
import { takePendingCallAction } from '@/utils/callNotifications';
import { callEngine } from '../callEngine';
import { CallService } from '@/store/call/callService';
import { reportNativeCallState } from '@/services/voice/chatwootCalls';
import { closeSession } from '@/services/voice/pendingJoins';
import { addCall, markLocalCall, removeCall } from '@/store/call/callSlice';

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
jest.mock('@/utils/callNotifications', () => ({ takePendingCallAction: jest.fn() }));
jest.mock('@/utils/voiceCallFeedback', () => ({ reportAnswerFailure: jest.fn() }));
jest.mock('../callerInfo', () => ({
  selectCallerInfo: () => ({ name: 'Caller', phone: '+15555550100', inboxName: 'Inbox' }),
}));
jest.mock('@/services/voice/chatwootCalls', () => ({
  markCallAnswering: jest.fn(),
  abandonAnswer: jest.fn(),
  reportNativeCallState: jest.fn(),
  isSystemCallUiAvailable: jest.fn(() => true),
  startOutgoingSystemCall: jest.fn(),
  endSystemCall: jest.fn(),
}));
jest.mock('@/services/voice/callEngine', () => ({
  callEngine: {
    whatsapp: { createAnswer: jest.fn(), hangup: jest.fn(async () => {}) },
    hangup: jest.fn(async () => {}),
    setMuted: jest.fn(async () => {}),
  },
}));
jest.mock('@/services/voice/webrtcEngine', () => ({
  webrtcEngine: {},
  setWebrtcConnectionLostHandler: jest.fn(),
}));
jest.mock('@/store/call/callService', () => ({
  CallService: {
    getWhatsappCall: jest.fn(async () => ({ sdp_offer: 'offer' })),
    acceptWhatsappCall: jest.fn(async () => ({})),
    terminateWhatsappCall: jest.fn(async () => ({})),
    rejectWhatsappCall: jest.fn(async () => ({})),
  },
}));

test('applies queued answers one at a time, keeping the joining call this device’s own until the next can join', async () => {
  const queue = [
    { action: 'answer', callSid: 'A', callId: 1, provider: 'whatsapp' },
    { action: 'answer', callSid: 'B', callId: 2, provider: 'whatsapp' },
  ];
  (takePendingCallAction as jest.Mock).mockImplementation(() => queue.shift() ?? null);
  const answers: ((sdp: string) => void)[] = [];
  (callEngine.whatsapp.createAnswer as jest.Mock).mockImplementation(
    () =>
      new Promise(resolve => {
        answers.push(resolve);
      }),
  );
  const first = applyPendingCallAction();
  await new Promise(resolve => setTimeout(resolve, 0));
  const second = applyPendingCallAction();
  await new Promise(resolve => setTimeout(resolve, 0));
  expect(store.getState().calls.localCallSid).toBe('A');
  expect(queue).toHaveLength(1);
  expect(answers).toHaveLength(1);
  answers[0]('answer-a');
  await new Promise(resolve => setTimeout(resolve, 0));
  // B starts joining only once A has joined
  expect(answers).toHaveLength(2);
  expect(CallService.acceptWhatsappCall).toHaveBeenCalledTimes(1);
  answers[1]('answer-b');
  await Promise.all([first, second]);
  expect(reportNativeCallState).not.toHaveBeenCalledWith('failed', 'B');
  expect(CallService.acceptWhatsappCall).toHaveBeenCalledTimes(2);
  expect(store.getState().calls.localCallSid).toBe('B');
});

test('an answer releases the outbound call this device is placing before taking over', async () => {
  (CallService.terminateWhatsappCall as jest.Mock).mockClear();
  // The calls the previous test left behind
  store.getState().calls.calls.forEach(call => store.dispatch(removeCall(call.callSid)));
  store.dispatch(
    addCall({ callSid: 'out', callId: 9, provider: 'whatsapp', callDirection: 'outbound' }),
  );
  store.dispatch(markLocalCall('out'));
  const queue = [{ action: 'answer', callSid: 'in', callId: 3, provider: 'whatsapp' }];
  (takePendingCallAction as jest.Mock).mockImplementation(() => queue.shift() ?? null);
  (callEngine.whatsapp.createAnswer as jest.Mock).mockResolvedValue('answer-in');

  await applyPendingCallAction();

  expect(CallService.terminateWhatsappCall).toHaveBeenCalledWith(9, undefined);
  expect(store.getState().calls.calls.map(call => call.callSid)).toEqual(['in']);
  expect(store.getState().calls.localCallSid).toBe('in');
});

test('ending the session waits for queued answers and declines those it reaches', async () => {
  store.getState().calls.calls.forEach(call => store.dispatch(removeCall(call.callSid)));
  store.dispatch(markLocalCall(null));
  (CallService.acceptWhatsappCall as jest.Mock).mockClear();
  (CallService.rejectWhatsappCall as jest.Mock).mockClear();
  const queue = [
    { action: 'answer', callSid: 'first', callId: 11, provider: 'whatsapp' },
    { action: 'answer', callSid: 'second', callId: 12, provider: 'whatsapp' },
  ];
  (takePendingCallAction as jest.Mock).mockImplementation(() => queue.shift() ?? null);
  let finishFirst!: (sdp: string) => void;
  (callEngine.whatsapp.createAnswer as jest.Mock).mockImplementationOnce(
    () =>
      new Promise(resolve => {
        finishFirst = resolve;
      }),
  );
  const draining = applyPendingCallAction();
  await new Promise(resolve => setTimeout(resolve, 0));
  let closed = false;
  const closing = closeSession(async () => {
    closed = true;
  });
  finishFirst('answer-first');
  await Promise.all([draining, closing]);

  expect(closed).toBe(true);
  expect(CallService.acceptWhatsappCall).toHaveBeenCalledTimes(1);
  expect(CallService.rejectWhatsappCall).toHaveBeenCalledWith(12, undefined);
  expect(
    store.getState().calls.calls.some(call => call.callSid === 'second' && call.isActive),
  ).toBe(false);
});
