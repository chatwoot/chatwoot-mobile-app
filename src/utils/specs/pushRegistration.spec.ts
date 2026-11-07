import { AppState } from 'react-native';
import { onTokenRefresh } from '@react-native-firebase/messaging';
import { subscribePushRegistration } from '../pushRegistration';

jest.mock('@react-native-firebase/messaging', () => ({
  getMessaging: jest.fn(),
  onTokenRefresh: jest.fn(),
}));

const flush = () => new Promise(resolve => setImmediate(resolve));

describe('push registration lifecycle', () => {
  afterEach(() => jest.restoreAllMocks());
  it('recovers after a failed startup and refreshes tokens without repeating permission prompts', async () => {
    const remove = jest.fn();
    const unsubscribe = jest.fn();
    AppState.currentState = 'active';
    jest.spyOn(AppState, 'addEventListener').mockReturnValue({ remove });
    jest.mocked(onTokenRefresh).mockReturnValue(unsubscribe);
    const register = jest
      .fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue(undefined);
    const prepare = jest.fn().mockResolvedValue(undefined);
    const dispose = subscribePushRegistration(register, prepare);
    await flush();
    expect(register).toHaveBeenCalledTimes(1);
    expect(prepare).toHaveBeenCalledTimes(1);

    const change = jest.mocked(AppState.addEventListener).mock.calls[0][1];
    change('background');
    change('active');
    change('active');
    await flush();
    expect(register).toHaveBeenCalledTimes(2);
    expect(prepare).toHaveBeenCalledTimes(1);

    const refresh = jest.mocked(onTokenRefresh).mock.calls[0][1];
    refresh('rotated-token');
    await flush();
    expect(register).toHaveBeenCalledTimes(3);
    refresh('queued-before-logout');
    dispose();
    await flush();
    expect(register).toHaveBeenCalledTimes(3);
    expect(remove).toHaveBeenCalledTimes(1);
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it('serializes registration behind initial permissions and call readiness', async () => {
    let ready!: () => void;
    const prepare = jest.fn(
      () =>
        new Promise<void>(resolve => {
          ready = resolve;
        }),
    );
    const register = jest.fn().mockResolvedValue(undefined);
    AppState.currentState = 'active';
    jest.spyOn(AppState, 'addEventListener').mockReturnValue({ remove: jest.fn() });
    jest.mocked(onTokenRefresh).mockReturnValue(jest.fn());
    const dispose = subscribePushRegistration(register, prepare);
    await flush();
    const refresh = jest.mocked(onTokenRefresh).mock.calls.at(-1)![1];
    refresh('rotated-while-prompt-open');
    await flush();
    expect(prepare).toHaveBeenCalledTimes(1);
    expect(register).not.toHaveBeenCalled();
    ready();
    await flush();
    expect(register).toHaveBeenCalledTimes(2);
    expect(prepare).toHaveBeenCalledTimes(1);
    dispose();
  });

  it('cancels startup registration if logout happens while permissions are open', async () => {
    let ready!: () => void;
    const prepare = () =>
      new Promise<void>(resolve => {
        ready = resolve;
      });
    const register = jest.fn().mockResolvedValue(undefined);
    jest.spyOn(AppState, 'addEventListener').mockReturnValue({ remove: jest.fn() });
    jest.mocked(onTokenRefresh).mockReturnValue(jest.fn());
    const dispose = subscribePushRegistration(register, prepare);
    await flush();
    dispose();
    ready();
    await flush();
    expect(register).not.toHaveBeenCalled();
  });
});
