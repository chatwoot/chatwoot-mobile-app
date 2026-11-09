import { AxiosError, AxiosHeaders } from 'axios';

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
    saveVoipToken: jest.fn(),
  },
}));

jest.mock('@/services/voice/chatwootCalls', () => ({
  getVoipToken: () => 'voip-token',
  isSystemCallUiAvailable: () => true,
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
});

const saveVoipToken = () => settingsActions.saveVoipToken()(jest.fn(), () => ({}), undefined);

const axiosError = (status?: number) =>
  new AxiosError(
    'Request failed',
    status ? 'ERR_BAD_REQUEST' : 'ERR_NETWORK',
    undefined,
    undefined,
    status
      ? { status, statusText: '', data: {}, headers: {}, config: { headers: new AxiosHeaders() } }
      : undefined,
  );

describe('saveVoipToken', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns the saved token', async () => {
    (SettingsService.saveVoipToken as jest.Mock).mockResolvedValue(undefined);

    const action = await saveVoipToken();

    expect(action.payload).toEqual({ voipToken: 'voip-token' });
  });

  it('rejects with the status the server answered', async () => {
    (SettingsService.saveVoipToken as jest.Mock).mockRejectedValue(axiosError(422));

    const action = await saveVoipToken();

    expect(action.type).toBe('settings/saveVoipToken/rejected');
    expect(action.payload).toEqual({ status: 422 });
  });

  it('rejects without a payload when the server never answered', async () => {
    (SettingsService.saveVoipToken as jest.Mock).mockRejectedValue(axiosError());

    const action = await saveVoipToken();

    expect(action.type).toBe('settings/saveVoipToken/rejected');
    expect(action.payload).toBeUndefined();
  });
});
