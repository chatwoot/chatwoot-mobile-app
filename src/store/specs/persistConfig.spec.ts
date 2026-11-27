import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sentry from '@sentry/react-native';

jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('@notifee/react-native', () => ({ __esModule: true, default: {} }));
jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  setUser: jest.fn(),
  setTag: jest.fn(),
  setContext: jest.fn(),
}));

const serialize = (state: Record<string, unknown>) =>
  JSON.stringify(
    Object.fromEntries(Object.entries(state).map(([key, value]) => [key, JSON.stringify(value)])),
  );

const deserialize = (raw: string | null) =>
  raw
    ? Object.fromEntries(
        Object.entries(JSON.parse(raw) as Record<string, string>).map(([key, value]) => [
          key,
          JSON.parse(value),
        ]),
      )
    : null;

const session = {
  auth: { accessToken: 'token', user: { id: 1, name: 'Agent' } },
  settings: {
    baseUrl: 'chat.example.com',
    installationUrl: 'https://chat.example.com/',
    webSocketUrl: 'wss://chat.example.com/cable',
  },
};

const loadStore = async () => {
  let loaded!: typeof import('@/store');
  jest.isolateModules(() => {
    loaded = jest.requireActual('@/store');
  });
  const { persistor } = loaded;
  await new Promise<void>(resolve => {
    if (persistor.getState().bootstrapped) return resolve();
    persistor.subscribe(() => persistor.getState().bootstrapped && resolve());
  });
  return loaded;
};

describe('store persistence', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it('keeps the session when the cached state cannot be read', async () => {
    await AsyncStorage.multiSet([
      ['persist:auth', serialize({ ...session.auth, _persist: { version: -1, rehydrated: true } })],
      [
        'persist:settings',
        serialize({ ...session.settings, _persist: { version: -1, rehydrated: true } }),
      ],
    ]);
    const readError = new Error('Row too big to fit into CursorWindow');
    const getItem = AsyncStorage.getItem as jest.Mock;
    const realGetItem = getItem.getMockImplementation()!;
    getItem.mockImplementation((key: string) =>
      key === 'persist:Root' ? Promise.reject(readError) : realGetItem(key),
    );

    const { store } = await loadStore();

    expect(store.getState().auth.accessToken).toBe('token');
    expect(store.getState().settings.installationUrl).toBe('https://chat.example.com/');
    expect(Sentry.captureException).toHaveBeenCalledWith(readError, {
      tags: { persistKey: 'Root' },
    });
    getItem.mockImplementation(realGetItem);
  });

  it('moves the session out of the cached state on installs that predate the split', async () => {
    await AsyncStorage.setItem(
      'persist:Root',
      serialize({ ...session, labels: { ids: [] }, _persist: { version: 2, rehydrated: true } }),
    );

    const { store, persistor } = await loadStore();
    await persistor.flush();

    expect(store.getState().auth.accessToken).toBe('token');
    expect(store.getState().settings.installationUrl).toBe('https://chat.example.com/');
    expect(deserialize(await AsyncStorage.getItem('persist:auth'))).toMatchObject({
      accessToken: 'token',
    });
    expect(deserialize(await AsyncStorage.getItem('persist:settings'))).toMatchObject({
      installationUrl: 'https://chat.example.com/',
    });
    const root = deserialize(await AsyncStorage.getItem('persist:Root'));
    expect(root).not.toHaveProperty('auth');
    expect(root).not.toHaveProperty('settings');
  });

  it('does not restore a session from a cached state older than version 2', async () => {
    await AsyncStorage.setItem(
      'persist:Root',
      serialize({ ...session, _persist: { version: 1, rehydrated: true } }),
    );

    const { store } = await loadStore();

    expect(store.getState().auth.accessToken).toBeNull();
    expect(store.getState().settings.installationUrl).toBe('https://app.chatwoot.com/');
  });

  it('clears the saved session on logout and keeps the server', async () => {
    await AsyncStorage.setItem(
      'persist:Root',
      serialize({ ...session, _persist: { version: 2, rehydrated: true } }),
    );
    const { store, persistor } = await loadStore();

    store.dispatch({ type: 'auth/logout' });
    await persistor.flush();

    expect(store.getState().auth.accessToken).toBeNull();
    expect(deserialize(await AsyncStorage.getItem('persist:auth'))).toMatchObject({
      accessToken: null,
    });
    expect(deserialize(await AsyncStorage.getItem('persist:settings'))).toMatchObject({
      installationUrl: 'https://chat.example.com/',
    });
  });
});
