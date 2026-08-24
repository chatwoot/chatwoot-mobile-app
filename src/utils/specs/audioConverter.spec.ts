import RNFS from 'react-native-fs';
import { FFmpegKit } from 'ffmpeg-kit-react-native';
import * as Sentry from '@sentry/react-native';

import { convertOggToWav } from '@/utils/audioConverter.ios';

jest.mock('react-native-fs', () => ({
  CachesDirectoryPath: '/caches',
  downloadFile: jest.fn(),
  exists: jest.fn(),
  unlink: jest.fn(),
}));

jest.mock('ffmpeg-kit-react-native', () => ({
  FFmpegKit: { execute: jest.fn() },
}));

jest.mock('@sentry/react-native', () => ({ captureException: jest.fn() }));

const mockRNFS = RNFS as jest.Mocked<typeof RNFS>;
const mockExecute = FFmpegKit.execute as jest.Mock;
const mockCapture = Sentry.captureException as jest.Mock;

const A = 'https://example.com/a.ogg';
const B = 'https://example.com/b.ogg';

// exists() is called for the cached output first, then for the downloaded
// input, then for the conversion output.
const existsSequence = (...values: boolean[]) => {
  const queue = [...values];
  mockRNFS.exists.mockImplementation(() => Promise.resolve(queue.shift() ?? false));
};

describe('convertOggToWav', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRNFS.downloadFile.mockReturnValue({
      promise: Promise.resolve({ statusCode: 200 }),
    } as never);
    mockExecute.mockResolvedValue(undefined);
    mockRNFS.unlink.mockResolvedValue(undefined as never);
  });

  it('gives each source url its own temp and output paths', async () => {
    existsSequence(false, true, true);
    await convertOggToWav(A);
    const firstDownload = mockRNFS.downloadFile.mock.calls[0][0];

    existsSequence(false, true, true);
    await convertOggToWav(B);
    const secondDownload = mockRNFS.downloadFile.mock.calls[1][0];

    // A shared temp file let one conversion delete the file another was using.
    expect(firstDownload.toFile).not.toEqual(secondDownload.toFile);
  });

  it('reuses an already converted file without downloading again', async () => {
    existsSequence(true);
    const result = await convertOggToWav(A);

    expect(mockRNFS.downloadFile).not.toHaveBeenCalled();
    expect(result).toContain('file:///caches/');
  });

  it('shares one conversion between concurrent callers of the same url', async () => {
    existsSequence(false, true, true);

    const [first, second] = await Promise.all([convertOggToWav(A), convertOggToWav(A)]);

    expect(mockRNFS.downloadFile).toHaveBeenCalledTimes(1);
    expect(first).toEqual(second);
  });

  it('throws when the download fails', async () => {
    existsSequence(false);
    mockRNFS.downloadFile.mockReturnValue({
      promise: Promise.resolve({ statusCode: 404 }),
    } as never);

    await expect(convertOggToWav(A)).rejects.toThrow('Download failed with status 404');
  });

  it('throws when the converted file is missing', async () => {
    existsSequence(false, true, false);

    await expect(convertOggToWav(A)).rejects.toThrow('Conversion failed - output file not found');
  });

  it('reports a failure to sentry once', async () => {
    existsSequence(false, false);

    await expect(convertOggToWav(A)).rejects.toThrow('Downloaded file not found');
    expect(mockCapture).toHaveBeenCalledTimes(1);
  });

  it('retries after a failure instead of caching the rejection', async () => {
    existsSequence(false, false);
    await expect(convertOggToWav(A)).rejects.toThrow();

    existsSequence(false, true, true);
    await expect(convertOggToWav(A)).resolves.toContain('file:///caches/');
  });
});
