jest.mock('expo-secure-store', () => ({
  AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: 4,
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

const setup = () => {
  // Isolate the in-memory cache to model a fresh app launch.
  jest.resetModules();
  return {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    storage: require('expo-secure-store') as typeof import('expo-secure-store'),
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    service: require('../cloudflareAccess') as typeof import('../cloudflareAccess'),
  };
};

const token = { clientId: 'device.access', clientSecret: 'test-device-secret' };
const origin = 'https://chat.example.com';

describe('Cloudflare Access credentials', () => {
  it('loads persisted credentials without putting them in a public status', async () => {
    const { storage, service } = setup();
    (storage.getItemAsync as jest.Mock).mockResolvedValue(JSON.stringify({ origin, ...token }));
    await service.loadCloudflareAccess();
    expect(service.getCloudflareAccessHeaders(`${origin}/api`)).toEqual({
      'CF-Access-Client-Id': token.clientId,
      'CF-Access-Client-Secret': token.clientSecret,
    });
    expect(typeof service.getCloudflareAccessRevision()).toBe('number');
  });

  it('sends headers only to the exact HTTPS origin or its WSS endpoint', async () => {
    const { service } = setup();
    await service.saveCloudflareAccess(origin, token);
    expect(service.getCloudflareAccessHeaders('wss://chat.example.com/cable')).toHaveProperty(
      'CF-Access-Client-Secret',
    );
    for (const url of [
      'http://chat.example.com/api',
      'ws://chat.example.com/cable',
      'https://chat.example.com.evil.test/api',
      'https://cdn.example.com/file',
      'https://chat.example.com:8443/api',
      'https://user@chat.example.com/api',
      'file:///chat.example.com',
      'https://chat.exa\nmple.com/api',
    ])
      expect(service.getCloudflareAccessHeaders(url)).toEqual({});
  });

  it('keeps the previous credential when a secure-store write fails', async () => {
    const { storage, service } = setup();
    await service.saveCloudflareAccess(origin, token);
    const revision = service.getCloudflareAccessRevision();
    (storage.setItemAsync as jest.Mock).mockRejectedValue(new Error('native error'));
    await expect(service.saveCloudflareAccess('https://other.example.com', token)).rejects.toThrow(
      'secure storage',
    );
    expect(service.getCloudflareAccessCredentials(origin)).toEqual(token);
    expect(service.getCloudflareAccessRevision()).toBe(revision);
  });

  it('fails closed after a read failure and recovers after an explicit replacement', async () => {
    const { storage, service } = setup();
    (storage.getItemAsync as jest.Mock).mockRejectedValue(new Error('native error'));
    await expect(service.loadCloudflareAccess()).rejects.toThrow('secure storage');
    expect(() => service.getCloudflareAccessHeaders(origin)).toThrow('secure storage');
    await service.saveCloudflareAccess(origin, token);
    await expect(service.loadCloudflareAccess()).resolves.toBeUndefined();
    expect(service.getCloudflareAccessCredentials(origin)).toEqual(token);
  });

  it('retries a temporary read failure without requiring a new token', async () => {
    const { storage, service } = setup();
    (storage.getItemAsync as jest.Mock)
      .mockRejectedValueOnce(new Error('Device not unlocked yet'))
      .mockResolvedValueOnce(JSON.stringify({ origin, ...token }));
    await expect(service.loadCloudflareAccess()).rejects.toThrow('secure storage');
    await service.loadCloudflareAccess();
    expect(service.getCloudflareAccessCredentials(origin)).toEqual(token);
    expect(storage.setItemAsync).not.toHaveBeenCalled();
  });

  it('does not let a stale native read overwrite a newly saved token', async () => {
    const { storage, service } = setup();
    let finishRead!: (value: string) => void;
    (storage.getItemAsync as jest.Mock).mockReturnValue(
      new Promise<string>(resolve => {
        finishRead = resolve;
      }),
    );
    const read = service.loadCloudflareAccess();
    const replacement = { ...token, clientSecret: 'replacement-secret' };
    await service.saveCloudflareAccess(origin, replacement);
    finishRead(JSON.stringify({ origin, ...token }));
    await read;
    expect(service.getCloudflareAccessCredentials(origin)).toEqual(replacement);
  });

  it('removes credentials when disabled and notifies media consumers', async () => {
    const { storage, service } = setup();
    await service.saveCloudflareAccess(origin, token);
    const listener = jest.fn();
    const unsubscribe = service.subscribeCloudflareAccess(listener);
    await service.saveCloudflareAccess(origin, null);
    expect(storage.deleteItemAsync).toHaveBeenCalled();
    expect(service.getCloudflareAccessHeaders(origin)).toEqual({});
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it('rejects invalid header values and unsupported destinations', async () => {
    const { service } = setup();
    expect(() =>
      service.validateCloudflareAccessCredentials({ ...token, clientSecret: 'bad\r\nheader' }),
    ).toThrow();
    await expect(service.saveCloudflareAccess('http://chat.example.com', token)).rejects.toThrow(
      'HTTPS',
    );
  });
});
