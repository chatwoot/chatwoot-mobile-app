import RNFS from 'react-native-fs';
import { FFmpegKit, FFprobeKit } from 'ffmpeg-kit-react-native';
import * as Sentry from '@sentry/react-native';

import { preparePlayableAudio } from '@/utils/audioConverter.ios';

jest.mock('react-native-fs', () => ({
  CachesDirectoryPath: '/caches',
  downloadFile: jest.fn(),
  exists: jest.fn(),
  unlink: jest.fn(),
}));

jest.mock('ffmpeg-kit-react-native', () => ({
  FFmpegKit: { execute: jest.fn() },
  FFprobeKit: { getMediaInformation: jest.fn() },
}));

jest.mock('@sentry/react-native', () => ({ captureException: jest.fn() }));

jest.mock('expo-crypto', () => ({
  CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
  digestStringAsync: jest.fn((_algorithm: string, value: string) =>
    Promise.resolve(Buffer.from(value).toString('hex')),
  ),
}));

const mockRNFS = RNFS as jest.Mocked<typeof RNFS>;
const mockExecute = FFmpegKit.execute as jest.Mock;
const mockProbe = FFprobeKit.getMediaInformation as jest.Mock;

const probeResult = (format: string | undefined) => ({
  getMediaInformation: () => ({ getFormat: () => format }),
});
const mockCapture = Sentry.captureException as jest.Mock;

const A = { dataUrl: 'https://example.com/a.oga' };
const B = { dataUrl: 'https://example.com/b.oga' };
const UNKNOWN = { dataUrl: 'https://example.com/01sdhn' };

// exists() is called for the cached output first, then for the downloaded
// input, then for the conversion output.
const existsSequence = (...values: boolean[]) => {
  const queue = [...values];
  mockRNFS.exists.mockImplementation(() => Promise.resolve(queue.shift() ?? false));
};

describe('preparePlayableAudio', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRNFS.downloadFile.mockReturnValue({
      promise: Promise.resolve({ statusCode: 200 }),
    } as never);
    mockProbe.mockResolvedValue(probeResult('ogg'));
    mockExecute.mockResolvedValue(undefined);
    mockRNFS.unlink.mockResolvedValue(undefined as never);
  });

  it('returns natively playable sources untouched without downloading', async () => {
    const source = { dataUrl: 'https://example.com/a.mp3', contentType: 'audio/mpeg' };

    await expect(preparePlayableAudio(source)).resolves.toBe(source.dataUrl);
    expect(mockRNFS.downloadFile).not.toHaveBeenCalled();
  });

  it('converts ogg sources to a cached m4a file', async () => {
    existsSequence(false, true, true);

    const result = await preparePlayableAudio(A);

    expect(result).toMatch(/^file:\/\/\/caches\/audio_[a-z0-9]+\.m4a$/);
    expect(mockExecute).toHaveBeenCalledTimes(1);
    expect(mockExecute.mock.calls[0][0]).toContain('-c:a aac');
    expect(mockProbe).not.toHaveBeenCalled();
  });

  it('gives each source url its own temp and output paths', async () => {
    existsSequence(false, true, true);
    await preparePlayableAudio(A);
    const firstDownload = mockRNFS.downloadFile.mock.calls[0][0];

    existsSequence(false, true, true);
    await preparePlayableAudio(B);
    const secondDownload = mockRNFS.downloadFile.mock.calls[1][0];

    // A shared temp file let one conversion delete the file another was using.
    expect(firstDownload.toFile).not.toEqual(secondDownload.toFile);
  });

  it('reuses an already converted file without downloading again', async () => {
    existsSequence(true);
    const result = await preparePlayableAudio(A);

    expect(mockRNFS.downloadFile).not.toHaveBeenCalled();
    expect(result).toContain('file:///caches/');
  });

  it('shares one preparation between concurrent callers of the same url', async () => {
    existsSequence(false, true, true);

    const [first, second] = await Promise.all([preparePlayableAudio(A), preparePlayableAudio(A)]);

    expect(mockRNFS.downloadFile).toHaveBeenCalledTimes(1);
    expect(first).toEqual(second);
  });

  it('removes the downloaded file after converting', async () => {
    existsSequence(false, true, true);

    await preparePlayableAudio(A);

    expect(mockRNFS.unlink).toHaveBeenCalledWith(expect.stringMatching(/\.download$/));
  });

  describe('sources with no format metadata', () => {
    it('converts when ffprobe reports an ogg container', async () => {
      existsSequence(false, true, true);
      mockProbe.mockResolvedValue(probeResult('ogg'));

      const result = await preparePlayableAudio(UNKNOWN);

      expect(mockProbe).toHaveBeenCalledWith(expect.stringMatching(/\.download$/));
      expect(result).toMatch(/\.m4a$/);
    });

    it('plays from the original url when ffprobe reports a native format', async () => {
      existsSequence(false, true);
      mockProbe.mockResolvedValue(probeResult('mp3'));

      const result = await preparePlayableAudio(UNKNOWN);

      expect(result).toBe(UNKNOWN.dataUrl);
      expect(mockExecute).not.toHaveBeenCalled();
      expect(mockRNFS.unlink).toHaveBeenCalledWith(expect.stringMatching(/\.download$/));
    });
  });

  it('throws when the download fails', async () => {
    existsSequence(false);
    mockRNFS.downloadFile.mockReturnValue({
      promise: Promise.resolve({ statusCode: 404 }),
    } as never);

    await expect(preparePlayableAudio(A)).rejects.toThrow('Download failed with status 404');
  });

  it('throws when the converted file is missing', async () => {
    existsSequence(false, true, false);

    await expect(preparePlayableAudio(A)).rejects.toThrow(
      'Conversion failed - output file not found',
    );
  });

  it('reports a failure to sentry once', async () => {
    existsSequence(false, false);

    await expect(preparePlayableAudio(A)).rejects.toThrow('Downloaded file not found');
    expect(mockCapture).toHaveBeenCalledTimes(1);
  });

  it('retries after a failure instead of caching the rejection', async () => {
    existsSequence(false, false);
    await expect(preparePlayableAudio(A)).rejects.toThrow();

    existsSequence(false, true, true);
    await expect(preparePlayableAudio(A)).resolves.toContain('file:///caches/');
  });
});
