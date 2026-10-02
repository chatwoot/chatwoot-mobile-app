import { AppState } from 'react-native';
import { onTokenRefresh } from '@react-native-firebase/messaging';
import { subscribePushRegistration } from '../pushRegistration';

jest.mock('@react-native-firebase/messaging', () => ({
  getMessaging: jest.fn(),
  onTokenRefresh: jest.fn(),
}));

const flush = () => new Promise(resolve => setImmediate(resolve));

describe('push registration lifecycle', () => {
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
    const dispose = subscribePushRegistration(register);
    await flush();
    expect(register).toHaveBeenNthCalledWith(1, true);

    const change = jest.mocked(AppState.addEventListener).mock.calls[0][1];
    change('background');
    change('active');
    change('active');
    await flush();
    expect(register).toHaveBeenCalledTimes(2);
    expect(register).toHaveBeenNthCalledWith(2, false);

    const refresh = jest.mocked(onTokenRefresh).mock.calls[0][1];
    refresh('rotated-token');
    await flush();
    expect(register).toHaveBeenNthCalledWith(3, false);
    refresh('queued-before-logout');
    dispose();
    await flush();
    expect(register).toHaveBeenCalledTimes(3);
    expect(remove).toHaveBeenCalledTimes(1);
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});
