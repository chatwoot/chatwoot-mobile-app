import ReactNativeBlobUtil from 'react-native-blob-util';

import {
  getCloudflareAccessHeaders,
  getCloudflareAccessRevision,
} from '@/services/cloudflareAccess';
import { requiresCloudflareMedia, resolveCloudflareMedia } from '../cloudflareMedia';

jest.mock('react-native-blob-util', () => {
  const fetch = jest.fn();
  return {
    config: jest.fn(() => ({ fetch })),
    fetch,
    fs: {
      dirs: { CacheDir: '/cache' },
      mv: jest.fn(() => Promise.resolve()),
      unlink: jest.fn(() => Promise.resolve()),
      ls: jest.fn(() => Promise.resolve([])),
      exists: jest.fn(() => Promise.resolve(true)),
    },
  };
});

jest.mock('expo-crypto', () => ({
  randomUUID: () => 'test-session',
  CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
  digestStringAsync: jest.fn((_algorithm: string, value: string) =>
    Promise.resolve(Buffer.from(value).toString('hex')),
  ),
}));

jest.mock('@/services/cloudflareAccess', () => ({
  getCloudflareAccessHeaders: jest.fn(),
  getCloudflareAccessRevision: jest.fn(),
}));

const headers = { 'CF-Access-Client-Id': 'test-id', 'CF-Access-Client-Secret': 'test-secret' };
const source = 'https://chat.example.com/rails/active_storage/image.png';
const mockFetch = ReactNativeBlobUtil.fetch as jest.Mock;
const mockHeaders = getCloudflareAccessHeaders as jest.Mock;
const mockRevision = getCloudflareAccessRevision as jest.Mock;
const response = (status = 200, responseHeaders = {}) => ({
  info: () => ({ status, headers: responseHeaders }),
});
let revision = 0;

beforeEach(() => {
  jest.clearAllMocks();
  revision += 1;
  mockRevision.mockImplementation(() => revision);
  mockHeaders.mockImplementation((url: string) =>
    new URL(url).origin === 'https://chat.example.com' ? headers : {},
  );
  mockFetch.mockReset().mockResolvedValue(response());
  (ReactNativeBlobUtil.fs.exists as jest.Mock).mockReset().mockResolvedValue(true);
});

it('leaves external and local sources untouched without downloading them', async () => {
  for (const url of [
    'https://cdn.example.com/image.jpg',
    'file:///cache/image.jpg',
    'content://1',
  ]) {
    await expect(resolveCloudflareMedia(url)).resolves.toBe(url);
    expect(requiresCloudflareMedia(url)).toBe(false);
  }
  expect(ReactNativeBlobUtil.config).not.toHaveBeenCalled();
});

it('downloads protected media to a local file with native redirects disabled', async () => {
  (ReactNativeBlobUtil.fs.ls as jest.Mock).mockResolvedValueOnce([
    'cf_media_old-process_image.png',
    'cf_media_old-process_image.png.partial',
    'cf_media_test-session_live.png',
    'unrelated-cache-file',
  ]);
  await expect(resolveCloudflareMedia(source)).resolves.toMatch(
    /^file:\/\/\/cache\/cf_media_.*\.png$/,
  );
  expect(mockFetch).toHaveBeenCalledWith('GET', source, headers);
  expect(ReactNativeBlobUtil.config).toHaveBeenCalledWith(
    expect.objectContaining({ followRedirect: false }),
  );
  expect(ReactNativeBlobUtil.fs.unlink).toHaveBeenCalledWith(
    '/cache/cf_media_old-process_image.png',
  );
  expect(ReactNativeBlobUtil.fs.unlink).toHaveBeenCalledWith(
    '/cache/cf_media_old-process_image.png.partial',
  );
  expect(ReactNativeBlobUtil.fs.unlink).not.toHaveBeenCalledWith(
    '/cache/cf_media_test-session_live.png',
  );
  expect(ReactNativeBlobUtil.fs.unlink).not.toHaveBeenCalledWith('/cache/unrelated-cache-file');
  expect((ReactNativeBlobUtil.fs.unlink as jest.Mock).mock.invocationCallOrder[0]).toBeLessThan(
    mockFetch.mock.invocationCallOrder[0],
  );
  await resolveCloudflareMedia('https://chat.example.com/another-image.png');
  expect(ReactNativeBlobUtil.fs.ls).toHaveBeenCalledTimes(1);
});

it('recomputes headers for every redirect and never forwards credentials to object storage', async () => {
  mockFetch
    .mockResolvedValueOnce(response(302, { Location: '/redirect' }))
    .mockResolvedValueOnce(response(307, { location: 'https://objects.example.com/signed/image' }))
    .mockResolvedValueOnce(response());

  await resolveCloudflareMedia(source);

  expect(mockFetch.mock.calls).toEqual([
    ['GET', source, headers],
    ['GET', 'https://chat.example.com/redirect', headers],
    ['GET', 'https://objects.example.com/signed/image', {}],
  ]);
});

it.each(['http://objects.example.com/image', 'https://user:password@objects.example.com/image'])(
  'rejects an unsafe redirect without requesting its destination: %s',
  async destination => {
    mockFetch.mockResolvedValueOnce(response(302, { Location: destination }));

    await expect(resolveCloudflareMedia(source)).rejects.toThrow('Unable to load protected media');
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(ReactNativeBlobUtil.fs.mv).not.toHaveBeenCalled();
  },
);

it('rejects userinfo in the original URL without issuing a request', async () => {
  const unsafeUrl = 'https://user:password@chat.example.com/image.png';
  expect(requiresCloudflareMedia(unsafeUrl)).toBe(true);
  await expect(resolveCloudflareMedia(unsafeUrl)).rejects.toThrow('Unable to load protected media');
  expect(mockFetch).not.toHaveBeenCalled();
});

it('stops redirect loops after five redirects', async () => {
  mockFetch.mockResolvedValue(response(302, { Location: source }));
  await expect(resolveCloudflareMedia(source)).rejects.toThrow('Unable to load protected media');
  expect(mockFetch).toHaveBeenCalledTimes(6);
});

it('shares successful downloads only within the same configuration revision', async () => {
  const [first, concurrent] = await Promise.all([
    resolveCloudflareMedia(source),
    resolveCloudflareMedia(source),
  ]);
  expect(first).toBe(concurrent);
  expect(mockFetch).toHaveBeenCalledTimes(1);

  revision += 1;
  const second = await resolveCloudflareMedia(source);
  expect(second).not.toBe(first);
  expect(mockFetch).toHaveBeenCalledTimes(2);
});

it('redownloads a completed entry whose file was evicted without racing concurrent callers', async () => {
  const first = await resolveCloudflareMedia(source);
  (ReactNativeBlobUtil.fs.exists as jest.Mock)
    .mockResolvedValueOnce(false)
    .mockResolvedValueOnce(false);

  const [second, concurrent] = await Promise.all([
    resolveCloudflareMedia(source),
    resolveCloudflareMedia(source),
  ]);

  expect(second).toBe(first);
  expect(concurrent).toBe(second);
  expect(mockFetch).toHaveBeenCalledTimes(2);
});

it('discards a download if the configuration changes while it is in flight', async () => {
  mockFetch.mockImplementationOnce(async () => {
    revision += 1;
    return response();
  });
  await expect(resolveCloudflareMedia(source)).rejects.toThrow('Unable to load protected media');
  expect(ReactNativeBlobUtil.fs.mv).not.toHaveBeenCalled();
});

it('replaces native request errors with a generic error containing no credentials', async () => {
  mockFetch.mockRejectedValueOnce({ message: 'native test-secret', config: { headers } });
  const error = await resolveCloudflareMedia(source).catch(value => value);
  expect(error).toEqual(new Error('Unable to load protected media'));
  expect(error.config).toBeUndefined();

  await expect(resolveCloudflareMedia(source)).resolves.toContain('file://');
  expect(mockFetch).toHaveBeenCalledTimes(2);
});

it('rejects denied downloads instead of returning a remote source', async () => {
  mockFetch.mockResolvedValueOnce(response(403));
  await expect(resolveCloudflareMedia(source)).rejects.toThrow('Unable to load protected media');
  expect(ReactNativeBlobUtil.fs.mv).not.toHaveBeenCalled();
});
