import { twilioConnect, twilioDisconnect } from '../../../../modules/chatwoot-calls/src';
import native from '../../../../modules/chatwoot-calls/src/ChatwootCallsModule';

jest.mock('react-native-device-info', () => ({ isEmulatorSync: () => false }));
jest.mock('../../../../modules/chatwoot-calls/src/ChatwootCallsModule', () => ({
  __esModule: true,
  default: {
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    twilioConnect: jest.fn(async () => {}),
    twilioDisconnect: jest.fn(),
  },
}));

afterEach(() => {
  jest.useRealTimers();
  jest.clearAllMocks();
});

test('a local disconnect settles the pending connect at once, before any native report', async () => {
  jest.useFakeTimers();
  let result = 'pending';
  const joining = twilioConnect('token', { call_sid: 'CA1' }).then(
    () => {
      result = 'joined';
    },
    error => {
      result = error.message;
    },
  );
  await Promise.resolve();
  twilioDisconnect();
  await joining;
  expect(native!.twilioDisconnect).toHaveBeenCalledTimes(1);
  expect(result).toBe('Call disconnected');
  expect(jest.getTimerCount()).toBe(0);
});

test('normal native terminal callback promptly rejects the real pending wrapper', async () => {
  jest.useFakeTimers();
  const joining = twilioConnect('token', { call_sid: 'CA2' });
  const check = expect(joining).rejects.toThrow('Call disconnected');
  const listener = (native!.addListener as jest.Mock).mock.calls[0][1];
  listener({ state: 'disconnected' });
  await check;
  expect(jest.getTimerCount()).toBe(0);
});
