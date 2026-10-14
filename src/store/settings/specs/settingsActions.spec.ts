import { settingsActions } from '../settingsActions';
import { SettingsService } from '../settingsService';

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
  settingsActions.setInstallationUrl(url)(jest.fn(), () => ({}), undefined);

describe('setInstallationUrl', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (SettingsService.verifyInstallationUrl as jest.Mock).mockResolvedValue(true);
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

  it('handles explicit http scheme with ip and port', async () => {
    const action = await setInstallationUrl('http://192.168.0.71:9668/');

    expect(action.payload).toEqual({
      installationUrl: 'http://192.168.0.71:9668/',
      webSocketUrl: 'ws://192.168.0.71:9668/cable',
      baseUrl: '192.168.0.71:9668',
    });
  });

  it('handles bare ip:port by falling back to http when https verification fails', async () => {
    (SettingsService.verifyInstallationUrl as jest.Mock).mockImplementation((url: string) =>
      Promise.resolve(url.startsWith('http://')),
    );

    const action = await setInstallationUrl('192.168.0.71:9668');

    expect(action.payload).toEqual({
      installationUrl: 'http://192.168.0.71:9668/',
      webSocketUrl: 'ws://192.168.0.71:9668/cable',
      baseUrl: '192.168.0.71:9668',
    });
  });

  it('rejects when both https and http verification fail', async () => {
    (SettingsService.verifyInstallationUrl as jest.Mock).mockResolvedValue(false);

    const action = await setInstallationUrl('192.168.0.71:9668');

    expect(action.type).toBe('settings/setInstallationUrl/rejected');
  });

  it('preserves explicit port 443 on bare local IP across HTTP fallback', async () => {
    (SettingsService.verifyInstallationUrl as jest.Mock).mockImplementation((url: string) =>
      Promise.resolve(url.startsWith('http://')),
    );

    const action = await setInstallationUrl('192.168.0.71:443');

    expect(action.payload).toEqual({
      installationUrl: 'http://192.168.0.71:443/',
      webSocketUrl: 'ws://192.168.0.71:443/cable',
      baseUrl: '192.168.0.71:443',
    });
  });

  it('does not downgrade bare public host to http when https fails', async () => {
    (SettingsService.verifyInstallationUrl as jest.Mock).mockImplementation((url: string) =>
      Promise.resolve(url.startsWith('http://')),
    );

    const action = await setInstallationUrl('app.chatwoot.com');

    expect(action.type).toBe('settings/setInstallationUrl/rejected');
  });

  it('allows explicit http scheme on public host', async () => {
    (SettingsService.verifyInstallationUrl as jest.Mock).mockImplementation((url: string) =>
      Promise.resolve(url.startsWith('http://')),
    );

    const action = await setInstallationUrl('http://chatwoot.example.com');

    expect(action.payload).toEqual({
      installationUrl: 'http://chatwoot.example.com/',
      webSocketUrl: 'ws://chatwoot.example.com/cable',
      baseUrl: 'chatwoot.example.com',
    });
  });
});
