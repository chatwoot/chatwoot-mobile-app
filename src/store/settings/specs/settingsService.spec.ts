import axios from 'axios';
import { SettingsService } from '../settingsService';
import { getCloudflareAccessCredentials } from '@/services/cloudflareAccess';
import { createCloudflareAccessAdapter } from '@/services/cloudflareAccessAdapter';

jest.mock('axios', () => ({ get: jest.fn() }));
jest.mock('@/services/APIService', () => ({ apiService: {} }));
jest.mock('@/services/cloudflareAccess', () => ({
  loadCloudflareAccess: jest.fn().mockResolvedValue(undefined),
  getCloudflareAccessCredentials: jest.fn().mockReturnValue(null),
}));
jest.mock('@/services/cloudflareAccessAdapter', () => ({
  createCloudflareAccessAdapter: jest.fn(() => 'protected-adapter'),
}));

describe('installation verification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getCloudflareAccessCredentials as jest.Mock).mockReturnValue(null);
  });

  it('accepts the Chatwoot version response', async () => {
    (axios.get as jest.Mock).mockResolvedValue({ data: { version: '4.18.0' } });
    await expect(SettingsService.verifyInstallationUrl('https://chat.example.com/')).resolves.toBe(
      true,
    );
  });

  it('rejects an HTML Access page even when its HTTP status was 200', async () => {
    (axios.get as jest.Mock).mockResolvedValue({ data: '<html>Cloudflare Access</html>' });
    await expect(SettingsService.verifyInstallationUrl('https://chat.example.com/')).resolves.toBe(
      false,
    );
  });

  it('verifies a candidate token before it is persisted', async () => {
    const token = { clientId: 'device.access', clientSecret: 'test-secret' };
    (axios.get as jest.Mock).mockResolvedValue({ data: { version: '4.18.0' } });
    await SettingsService.verifyInstallationUrl('https://chat.example.com/', token);
    expect(createCloudflareAccessAdapter).toHaveBeenCalledWith('https://chat.example.com', token);
    expect(axios.get).toHaveBeenCalledWith(
      'https://chat.example.com/api',
      expect.objectContaining({ adapter: 'protected-adapter' }),
    );
  });

  it('also authenticates the version check after login', async () => {
    const token = { clientId: 'device.access', clientSecret: 'test-secret' };
    (getCloudflareAccessCredentials as jest.Mock).mockReturnValue(token);
    (axios.get as jest.Mock).mockResolvedValue({ data: { version: '4.18.0' } });
    await expect(SettingsService.getChatwootVersion('https://chat.example.com/')).resolves.toEqual({
      version: '4.18.0',
    });
    expect(createCloudflareAccessAdapter).toHaveBeenCalledWith('https://chat.example.com', token);
  });
});
