import axios from 'axios';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { createCloudflareAccessAdapter } from '../cloudflareAccessAdapter';

jest.mock('react-native-blob-util', () => ({
  config: jest.fn().mockReturnThis(),
  fetch: jest.fn(),
  wrap: (path: string) => `wrapped:${path}`,
}));
jest.mock('expo-secure-store', () => ({}));

const origin = 'https://chat.example.com';
const token = { clientId: 'device.access', clientSecret: 'test-secret-for-transport' };
const adapter = createCloudflareAccessAdapter(origin, token);

const nativeResponse = (status: number, data: string) => {
  const response = {
    info: () => ({ status, headers: { 'Content-Type': 'application/json' } }),
    text: () => data,
  };
  const task = Object.assign(Promise.resolve(response), { cancel: jest.fn() });
  (ReactNativeBlobUtil.fetch as jest.Mock).mockReturnValue(task);
  return task;
};

describe('protected API transport', () => {
  beforeEach(() => jest.clearAllMocks());

  it('preserves JSON requests/responses and keeps the secret out of Axios configs', async () => {
    nativeResponse(200, '{"ok":true}');
    const response = await axios.post(
      `${origin}/auth/sign_in`,
      { email: 'user@example.com' },
      { adapter },
    );
    expect(response.data).toEqual({ ok: true });
    expect(ReactNativeBlobUtil.config).toHaveBeenCalledWith(
      expect.objectContaining({ followRedirect: false }),
    );
    expect(ReactNativeBlobUtil.fetch).toHaveBeenCalledWith(
      'POST',
      `${origin}/auth/sign_in`,
      expect.objectContaining({
        'CF-Access-Client-Secret': token.clientSecret,
        'Content-Type': 'application/json',
      }),
      JSON.stringify({ email: 'user@example.com' }),
    );
    expect(JSON.stringify(response.config)).not.toContain(token.clientSecret);
  });

  it("keeps Axios's no-timeout default and forwards explicit timeouts", async () => {
    nativeResponse(200, '{}');
    await axios.get(`${origin}/api`, { adapter });
    expect(ReactNativeBlobUtil.config).toHaveBeenLastCalledWith(
      expect.objectContaining({ timeout: 0 }),
    );

    nativeResponse(200, '{}');
    await axios.get(`${origin}/api`, { adapter, timeout: 5000 });
    expect(ReactNativeBlobUtil.config).toHaveBeenLastCalledWith(
      expect.objectContaining({ timeout: 5000 }),
    );
  });

  it('rejects redirects instead of forwarding credentials or login bodies', async () => {
    nativeResponse(302, '<html>Access login</html>');
    await expect(axios.get(`${origin}/api`, { adapter })).rejects.toMatchObject({
      response: { status: 302 },
    });
    expect(ReactNativeBlobUtil.fetch).toHaveBeenCalledTimes(1);
  });

  it('rejects a different origin before any native request', async () => {
    await expect(axios.get('https://evil.test/api', { adapter })).rejects.toThrow('does not match');
    expect(ReactNativeBlobUtil.fetch).not.toHaveBeenCalled();
  });

  it('supports native multipart file uploads without losing repeated fields', async () => {
    nativeResponse(200, '{}');
    const data = {
      getParts: () => [
        { fieldName: 'content', string: 'hello' },
        { fieldName: 'attachments[]', uri: 'file:///tmp/a.jpg', name: 'a.jpg', type: 'image/jpeg' },
        { fieldName: 'attachments[]', uri: 'content://files/2', name: 'b.jpg', type: 'image/jpeg' },
      ],
    };
    await axios.post(`${origin}/upload`, data, { adapter, transformRequest: value => value });
    expect((ReactNativeBlobUtil.fetch as jest.Mock).mock.calls[0][3]).toEqual([
      { name: 'content', data: 'hello' },
      { name: 'attachments[]', filename: 'a.jpg', type: 'image/jpeg', data: 'wrapped:/tmp/a.jpg' },
      {
        name: 'attachments[]',
        filename: 'b.jpg',
        type: 'image/jpeg',
        data: 'wrapped:content://files/2',
      },
    ]);
  });

  it('does not report raw native errors that might contain credentials', async () => {
    (ReactNativeBlobUtil.fetch as jest.Mock).mockReturnValue(
      Object.assign(Promise.reject(new Error(token.clientSecret)), { cancel: jest.fn() }),
    );
    try {
      await axios.get(`${origin}/api`, { adapter });
      throw new Error('Expected failure');
    } catch (error) {
      expect(axios.isAxiosError(error)).toBe(true);
      expect(JSON.stringify(error)).not.toContain(token.clientSecret);
      expect(String(error)).not.toContain(token.clientSecret);
    }
  });

  it('does not start an already-cancelled request', async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(
      axios.get(`${origin}/api`, { adapter, signal: controller.signal }),
    ).rejects.toMatchObject({ code: 'ERR_CANCELED' });
    expect(ReactNativeBlobUtil.fetch).not.toHaveBeenCalled();
  });
});
