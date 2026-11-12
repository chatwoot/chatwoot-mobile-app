import { Platform } from 'react-native';
import { runCallSessionTask } from '../callSessionTask';
import {
  abandonAnswer,
  takeNativeCallAction,
  reportNativeCallState,
} from '@/services/voice/chatwootCalls';
import { loadCloudflareAccess } from '@/services/cloudflareAccess';
import { attachCallSessionCore } from '../callSessionCore';

jest.mock('@/services/cloudflareAccess', () => ({
  loadCloudflareAccess: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/store', () => ({
  store: { getState: () => ({ auth: { user: null } }), subscribe: jest.fn() },
  persistor: { getState: () => ({ bootstrapped: true }), subscribe: jest.fn() },
}));
jest.mock('@/services/voice/chatwootCalls', () => ({
  reportNativeCallState: jest.fn(),
  takeNativeCallAction: jest.fn(),
  abandonAnswer: jest.fn(),
}));
jest.mock('../callSessionCore', () => ({
  applyPendingCallAction: jest.fn(),
  attachCallSessionCore: jest.fn(() => () => {}),
}));
jest.mock('@/utils/actionCable', () => ({ __esModule: true, default: {} }));

beforeEach(() => jest.clearAllMocks());

test('a signed-out phone drops the answers and declines waiting for it', async () => {
  jest.replaceProperty(Platform, 'OS', 'android');
  const waiting = [
    JSON.stringify({ action: 'answer', callSid: 'a' }),
    JSON.stringify({ action: 'decline', callSid: 'b' }),
  ];
  (takeNativeCallAction as jest.Mock).mockImplementation(() => waiting.shift() ?? null);

  await runCallSessionTask();

  expect(waiting).toEqual([]);
  expect(abandonAnswer).toHaveBeenCalledTimes(1);
  expect(abandonAnswer).toHaveBeenCalledWith('a');
});

test('an inaccessible service token fails the headless call without an unhandled rejection', async () => {
  jest.replaceProperty(Platform, 'OS', 'android');
  (loadCloudflareAccess as jest.Mock).mockRejectedValueOnce(new Error('Device locked'));
  const waiting = [JSON.stringify({ action: 'answer', callSid: 'locked-call' })];
  (takeNativeCallAction as jest.Mock).mockImplementation(() => waiting.shift() ?? null);

  await expect(runCallSessionTask()).resolves.toBeUndefined();

  expect(waiting).toEqual([]);
  expect(abandonAnswer).toHaveBeenCalledWith('locked-call');
  expect(reportNativeCallState).toHaveBeenCalledWith('failed');
  expect(attachCallSessionCore).not.toHaveBeenCalled();
});
