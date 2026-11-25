import axios from 'axios';
import { AppState, Platform, type AppStateStatus } from 'react-native';
import { HTTPS_PROBE_TIMEOUT_MS, SettingsService } from '../settingsService';

jest.mock('axios', () => ({
  get: jest.fn(),
  isAxiosError: jest.fn((err: unknown) =>
    Boolean((err as { isAxiosError?: boolean })?.isAxiosError),
  ),
}));

jest.mock('@/services/APIService', () => ({
  apiService: {
    get: jest.fn(),
    put: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('SettingsService.verifyInstallationUrl', () => {
  const originalPlatform = Platform.OS;
  let listeners: ((state: AppStateStatus) => void)[] = [];

  const emitAppState = (state: AppStateStatus) => {
    Object.defineProperty(AppState, 'currentState', {
      value: state,
      configurable: true,
    });
    [...listeners].forEach(listener => listener(state));
  };

  beforeEach(() => {
    jest.clearAllMocks();
    listeners = [];
    Object.defineProperty(Platform, 'OS', { value: 'ios', configurable: true });
    Object.defineProperty(AppState, 'currentState', { value: 'active', configurable: true });
    jest.spyOn(AppState, 'addEventListener').mockImplementation((_, handler) => {
      listeners.push(handler as (state: AppStateStatus) => void);
      return {
        remove: () => {
          listeners = listeners.filter(l => l !== handler);
        },
      } as ReturnType<typeof AppState.addEventListener>;
    });
  });

  afterAll(() => {
    Object.defineProperty(Platform, 'OS', { value: originalPlatform, configurable: true });
  });

  it('omits timeout when not specified and normalizes trailing slash', async () => {
    (axios.get as jest.Mock).mockResolvedValue({ status: 200 });

    const result = await SettingsService.verifyInstallationUrl('http://192.168.0.71:9668');

    expect(result).toBe(true);
    expect(axios.get).toHaveBeenCalledWith('http://192.168.0.71:9668/api');
    expect(listeners).toHaveLength(0);
  });

  it('passes timeout when provided for speculative probes', async () => {
    (axios.get as jest.Mock).mockResolvedValue({ status: 200 });

    const result = await SettingsService.verifyInstallationUrl('https://192.168.0.71:9668/', {
      timeout: HTTPS_PROBE_TIMEOUT_MS,
    });

    expect(result).toBe(true);
    expect(axios.get).toHaveBeenCalledWith('https://192.168.0.71:9668/api', {
      timeout: HTTPS_PROBE_TIMEOUT_MS,
    });
  });

  it('waits for iOS local-network consent prompt dismissal and retries once', async () => {
    let rejectFirst!: (err: Error) => void;
    (axios.get as jest.Mock)
      .mockImplementationOnce(
        () =>
          new Promise((_, reject) => {
            rejectFirst = reject;
          }),
      )
      .mockResolvedValueOnce({ status: 200 });

    const verificationPromise = SettingsService.verifyInstallationUrl(
      'https://192.168.0.71:9668/',
      { timeout: HTTPS_PROBE_TIMEOUT_MS },
    );

    // iOS shows Local Network permission alert (AppState becomes inactive)
    emitAppState('inactive');
    // First probe aborts while prompt is still on screen
    rejectFirst(Object.assign(new Error('timeout'), { isAxiosError: true, code: 'ECONNABORTED' }));

    await Promise.resolve();
    expect(axios.get).toHaveBeenCalledTimes(1);

    // User taps Allow (AppState returns to active)
    emitAppState('active');

    await expect(verificationPromise).resolves.toBe(true);
    expect(axios.get).toHaveBeenCalledTimes(2);
    expect(listeners).toHaveLength(0);
  });

  it('does not retry when the server returned an HTTP error response', async () => {
    let rejectFirst!: (err: Error) => void;
    (axios.get as jest.Mock).mockImplementationOnce(
      () =>
        new Promise((_, reject) => {
          rejectFirst = reject;
        }),
    );

    const verificationPromise = SettingsService.verifyInstallationUrl('http://192.168.0.71:9668/');

    emitAppState('inactive');
    rejectFirst(
      Object.assign(new Error('Not Found'), {
        isAxiosError: true,
        response: { status: 404 },
      }),
    );

    await expect(verificationPromise).resolves.toBe(false);
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(listeners).toHaveLength(0);
  });

  it('stops waiting without retrying if the app moves to background', async () => {
    let rejectFirst!: (err: Error) => void;
    (axios.get as jest.Mock).mockImplementationOnce(
      () =>
        new Promise((_, reject) => {
          rejectFirst = reject;
        }),
    );

    const verificationPromise = SettingsService.verifyInstallationUrl('http://192.168.0.71:9668/');

    emitAppState('inactive');
    rejectFirst(new Error('network error'));

    await Promise.resolve();
    emitAppState('background');

    await expect(verificationPromise).resolves.toBe(false);
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(listeners).toHaveLength(0);
  });

  it('does not subscribe to AppState on Android', async () => {
    Object.defineProperty(Platform, 'OS', { value: 'android', configurable: true });
    (axios.get as jest.Mock).mockRejectedValue(new Error('network error'));

    const result = await SettingsService.verifyInstallationUrl('http://192.168.0.71:9668/');

    expect(result).toBe(false);
    expect(AppState.addEventListener).not.toHaveBeenCalled();
  });
});
