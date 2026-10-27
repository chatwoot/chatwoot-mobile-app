import { configureStore } from '@reduxjs/toolkit';
import { Platform } from 'react-native';
import reducer, { addCall } from '@/store/call/callSlice';
import { systemCall } from '../systemCall';
import { pendingJoin } from '../pendingJoins';
import native from '../../../../modules/chatwoot-calls/src/ChatwootCallsModule';

jest.mock('react-native-device-info', () => ({ isEmulatorSync: () => false }));
jest.mock('../callerInfo', () => ({
  selectCallerInfo: jest.fn(() => ({ name: 'Caller', phone: '+1555' })),
}));
jest.mock('@/utils/voiceCallFeedback', () => ({ reportAnswerFailure: jest.fn() }));
jest.mock('../webrtcEngine', () => ({
  ensureMicrophonePermission: jest.fn(async () => {}),
  webrtcEngine: { abandonOpening: jest.fn(), hangup: jest.fn(async () => {}) },
}));
jest.mock('../../../../modules/chatwoot-calls/src/ChatwootCallsModule', () => ({
  __esModule: true,
  default: {
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    callKitReportIncoming: jest.fn(),
    callKitRequestAnswer: jest.fn(async () => {}),
    callKitEndCall: jest.fn(),
  },
}));

beforeEach(() => {
  jest.replaceProperty(Platform, 'OS', 'ios');
  jest.clearAllMocks();
});
afterEach(() => jest.restoreAllMocks());

const build = () =>
  configureStore({
    reducer: {
      calls: reducer,
      auth: (s = { user: { id: 1, account_id: 1, accounts: [] } }) => s,
    },
  });

const ringing = {
  callSid: 'sid',
  provider: 'whatsapp',
  callDirection: 'inbound',
  callId: 9,
} as const;

const holdReport = () => {
  let finish: (uuid: string) => void = () => {};
  (native!.callKitReportIncoming as jest.Mock).mockImplementationOnce(
    () => new Promise<string>(resolve => (finish = resolve)),
  );
  return (uuid: string) => finish(uuid);
};

test('an answer made while CallKit is still reporting the call answers the system call', async () => {
  const store = build();
  store.dispatch(addCall(ringing));
  const finishReport = holdReport();
  const call = store.getState().calls.calls.find(entry => entry.callSid === 'sid')!;

  const report = systemCall.reportRinging(store as never, call);
  const answer = systemCall.answer(store as never, call);
  expect(native!.callKitRequestAnswer).not.toHaveBeenCalled();
  expect(pendingJoin('sid')).toBeUndefined();

  finishReport('uuid');
  await report;
  await expect(answer).resolves.toEqual({ status: 'requested' });
  expect(native!.callKitRequestAnswer).toHaveBeenCalledWith('uuid');
  expect(pendingJoin('sid')).toBeUndefined();
});

test('an answer waiting on a report gives up when the call ended meanwhile', async () => {
  const store = build();
  store.dispatch(addCall(ringing));
  const finishReport = holdReport();
  const call = store.getState().calls.calls.find(entry => entry.callSid === 'sid')!;

  const report = systemCall.reportRinging(store as never, call);
  const answer = systemCall.answer(store as never, call);
  store.dispatch({ type: 'calls/removeCall', payload: 'sid' });

  finishReport('uuid');
  await report;
  await expect(answer).resolves.toEqual({ status: 'already_ended' });
  expect(native!.callKitRequestAnswer).not.toHaveBeenCalled();
});
