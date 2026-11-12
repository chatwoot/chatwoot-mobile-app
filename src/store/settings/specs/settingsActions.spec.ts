import { settingsActions } from '../settingsActions';
import { SettingsService } from '../settingsService';
import { getCloudflareAccessCredentials, saveCloudflareAccess } from '@/services/cloudflareAccess';
import { AppDispatch, RootState } from '@/store';

jest.mock('@/services/cloudflareAccess', () => ({
  loadCloudflareAccess: jest.fn().mockResolvedValue(undefined),
  getCloudflareAccessCredentials: jest.fn().mockReturnValue(null),
  saveCloudflareAccess: jest.fn().mockResolvedValue(undefined),
  validateCloudflareAccessCredentials: (value: { clientId: string; clientSecret: string }) => ({
    clientId: value.clientId.trim(),
    clientSecret: value.clientSecret.trim(),
  }),
}));

jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
}));

jest.mock('react-native-permissions', () => jest.requireActual('react-native-permissions/mock'));

jest.mock('@react-native-firebase/messaging', () => jest.fn());

jest.mock('react-native-device-info', () => ({
  getSystemName: jest.fn(),
  getManufacturer: jest.fn(),
  getModel: jest.fn(),
  getApiLevel: jest.fn(),
  getBrand: jest.fn(),
  getBuildNumber: jest.fn(),
  getUniqueId: jest.fn(),
}));

jest.mock('@/i18n', () => ({
  t: (key: string) => key,
}));

jest.mock('@/utils/toastUtils', () => ({
  showToast: jest.fn(),
}));

jest.mock('../settingsService', () => ({
  SettingsService: {
    verifyInstallationUrl: jest.fn(),
  },
}));

const setInstallationUrl = (url: string) =>
  settingsActions.setInstallationUrl(url)(
    jest.fn() as AppDispatch,
    () => ({}) as RootState,
    undefined,
  );

describe('setInstallationUrl', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (SettingsService.verifyInstallationUrl as jest.Mock).mockResolvedValue(true);
    (saveCloudflareAccess as jest.Mock).mockResolvedValue(undefined);
    (getCloudflareAccessCredentials as jest.Mock).mockReturnValue(null);
  });

  it('builds both URLs from the host', async () => {
    const action = await setInstallationUrl('app.chatwoot.com');

    expect(action.payload).toEqual({
      installationUrl: 'https://app.chatwoot.com/',
      webSocketUrl: 'wss://app.chatwoot.com/cable',
      baseUrl: 'app.chatwoot.com',
    });
  });

  it('keeps a pasted scheme out of the websocket URL', async () => {
    const action = await setInstallationUrl('https://app.chatwoot.com');

    expect(action.payload).toEqual({
      installationUrl: 'https://app.chatwoot.com/',
      webSocketUrl: 'wss://app.chatwoot.com/cable',
      baseUrl: 'app.chatwoot.com',
    });
  });

  it('keeps surrounding whitespace out of the websocket URL', async () => {
    const action = await setInstallationUrl('   https://app.chatwoot.com');

    expect(action.payload).toEqual({
      installationUrl: 'https://app.chatwoot.com/',
      webSocketUrl: 'wss://app.chatwoot.com/cable',
      baseUrl: 'app.chatwoot.com',
    });
  });

  it('rejects a host holding whitespace without calling the server', async () => {
    const action = await setInstallationUrl('app chatwoot.com');

    expect(action.type).toBe('settings/setInstallationUrl/rejected');
    expect(SettingsService.verifyInstallationUrl).not.toHaveBeenCalled();
  });

  it('verifies and stores a token without putting it in any dispatched action', async () => {
    const dispatch = jest.fn() as unknown as AppDispatch;
    const token = { clientId: 'device.access', clientSecret: 'test-secret-do-not-log' };
    const action = await settingsActions.setInstallationUrl('chat.example.com', token)(
      dispatch,
      () => ({}) as RootState,
      undefined,
    );

    expect(SettingsService.verifyInstallationUrl).toHaveBeenCalledWith(
      'https://chat.example.com/',
      token,
    );
    expect(saveCloudflareAccess).toHaveBeenCalledWith('https://chat.example.com/', token);
    expect(action.type).toBe('settings/setInstallationUrl/fulfilled');
    expect(JSON.stringify((dispatch as jest.Mock).mock.calls)).not.toContain(token.clientSecret);
  });

  it('does not overwrite a working token when verification fails', async () => {
    (SettingsService.verifyInstallationUrl as jest.Mock).mockResolvedValue(false);
    const action = await setInstallationUrl('chat.example.com');
    expect(action.type).toBe('settings/setInstallationUrl/rejected');
    expect(saveCloudflareAccess).not.toHaveBeenCalled();
  });

  it('removes the saved token after a successful connection with Access disabled', async () => {
    await settingsActions.setInstallationUrl('chat.example.com', null)(
      jest.fn() as AppDispatch,
      () => ({}) as RootState,
      undefined,
    );
    expect(SettingsService.verifyInstallationUrl).toHaveBeenCalledWith(
      'https://chat.example.com/',
      null,
    );
    expect(saveCloudflareAccess).toHaveBeenCalledWith('https://chat.example.com/', null);
  });

  it('rejects a connection if the secure-store write fails', async () => {
    (saveCloudflareAccess as jest.Mock).mockRejectedValue(new Error('Secure storage unavailable'));
    const action = await setInstallationUrl('chat.example.com');
    expect(action.type).toBe('settings/setInstallationUrl/rejected');
  });
});
