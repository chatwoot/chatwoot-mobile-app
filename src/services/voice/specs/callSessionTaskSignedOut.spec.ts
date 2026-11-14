import { Platform } from 'react-native';
import { runCallSessionTask } from '../callSessionTask';
import { abandonAnswer, takeNativeCallAction } from '@/services/voice/chatwootCalls';

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
