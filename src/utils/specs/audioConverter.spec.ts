import * as FileSystem from 'expo-file-system/legacy';
import { decodeAudioData } from 'react-native-audio-api';
import * as Sentry from '@sentry/react-native';

import { preparePlayableAudio } from '@/utils/audioConverter.ios';

jest.mock('expo-file-system/legacy', () => ({
  cacheDirectory: 'file:///caches/',
  EncodingType: { Base64: 'base64' },
  getInfoAsync: jest.fn(),
  writeAsStringAsync: jest.fn(),
}));

jest.mock('react-native-audio-api', () => ({ decodeAudioData: jest.fn() }));

jest.mock('@sentry/react-native', () => ({ captureException: jest.fn() }));

const mockGetInfo = FileSystem.getInfoAsync as jest.Mock;
const mockWrite = FileSystem.writeAsStringAsync as jest.Mock;
const mockDecode = decodeAudioData as jest.Mock;
const mockCapture = Sentry.captureException as jest.Mock;

const OGG_BYTES = new Uint8Array([0x4f, 0x67, 0x67, 0x53, 0, 0, 0, 0]).buffer;
const MP3_BYTES = new Uint8Array([0x49, 0x44, 0x33, 0x04, 0, 0, 0, 0]).buffer;

const A = { dataUrl: 'https://example.com/a.oga' };
const B = { dataUrl: 'https://example.com/b.oga' };
const UNKNOWN = { dataUrl: 'https://example.com/01sdhn' };

const decodedAudio = {
  sampleRate: 24000,
  numberOfChannels: 1,
  getChannelData: () => new Float32Array([0, 0.5, -0.5]),
};

const mockFetchResponse = (body: ArrayBuffer, status = 200) => {
  (global as { fetch: unknown }).fetch = jest.fn(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      arrayBuffer: () => Promise.resolve(body),
    }),
  );
  return global.fetch as jest.Mock;
};

describe('preparePlayableAudio', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetInfo.mockResolvedValue({ exists: false });
    mockWrite.mockResolvedValue(undefined);
    mockDecode.mockResolvedValue(decodedAudio);
    mockFetchResponse(OGG_BYTES);
  });

  it('returns natively playable sources untouched without downloading', async () => {
    const source = { dataUrl: 'https://example.com/a.mp3', contentType: 'audio/mpeg' };

    await expect(preparePlayableAudio(source)).resolves.toBe(source.dataUrl);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('decodes ogg sources into a cached wav file', async () => {
    const result = await preparePlayableAudio(A);

    expect(result).toMatch(/^file:\/\/\/caches\/audio_[a-z0-9]+\.wav$/);
    expect(mockDecode).toHaveBeenCalledWith(OGG_BYTES, 24000);
    expect(mockWrite).toHaveBeenCalledWith(result, expect.any(String), { encoding: 'base64' });
  });

  it('writes a wav file whose header matches the decoded audio', async () => {
    await preparePlayableAudio(A);

    const base64 = mockWrite.mock.calls[0][1] as string;
    const bytes = Buffer.from(base64, 'base64');
    expect(bytes.subarray(0, 4).toString('ascii')).toBe('RIFF');
    expect(bytes.readUInt32LE(24)).toBe(24000);
    expect(bytes.readUInt32LE(40)).toBe(3 * 2);
  });

  it('gives each source url its own output path', async () => {
    const first = await preparePlayableAudio(A);
    const second = await preparePlayableAudio(B);

    expect(first).not.toEqual(second);
  });

  it('reuses an already converted file without downloading again', async () => {
    mockGetInfo.mockResolvedValue({ exists: true });

    const result = await preparePlayableAudio(A);

    expect(global.fetch).not.toHaveBeenCalled();
    expect(result).toContain('file:///caches/');
  });

  it('shares one preparation between concurrent callers of the same url', async () => {
    const [first, second] = await Promise.all([preparePlayableAudio(A), preparePlayableAudio(A)]);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(first).toEqual(second);
  });

  describe('sources with no format metadata', () => {
    it('converts when the file starts with the ogg magic bytes', async () => {
      const result = await preparePlayableAudio(UNKNOWN);

      expect(result).toMatch(/\.wav$/);
    });

    it('plays from the original url when the header is natively supported', async () => {
      mockFetchResponse(MP3_BYTES);

      const result = await preparePlayableAudio(UNKNOWN);

      expect(result).toBe(UNKNOWN.dataUrl);
      expect(mockDecode).not.toHaveBeenCalled();
    });
  });

  it('throws when the download fails', async () => {
    mockFetchResponse(OGG_BYTES, 404);

    await expect(preparePlayableAudio(A)).rejects.toThrow('Download failed with status 404');
  });

  it('throws when the audio cannot be decoded', async () => {
    mockDecode.mockRejectedValue(new Error('Failed to decode audio data.'));

    await expect(preparePlayableAudio(A)).rejects.toThrow('Failed to decode audio data.');
    expect(mockWrite).not.toHaveBeenCalled();
  });

  it('reports a failure to sentry once', async () => {
    mockFetchResponse(OGG_BYTES, 500);

    await expect(preparePlayableAudio(A)).rejects.toThrow();
    expect(mockCapture).toHaveBeenCalledTimes(1);
  });

  it('retries after a failure instead of caching the rejection', async () => {
    mockFetchResponse(OGG_BYTES, 500);
    await expect(preparePlayableAudio(A)).rejects.toThrow();

    mockFetchResponse(OGG_BYTES);
    await expect(preparePlayableAudio(A)).resolves.toContain('file:///caches/');
  });
});
