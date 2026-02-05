import { getMp3FileInfo, getRecorderFileInfo } from '@/utils/audioFormatUtils';

describe('getRecorderFileInfo', () => {
  it('returns m4a for android when audio format is m4a', () => {
    const result = getRecorderFileInfo('audio/m4a', 'android');

    expect(result.extension).toBe('m4a');
    expect(result.mimeType).toBe('audio/m4a');
    expect(result.androidOutputFormat).toBe(2);
    expect(result.androidAudioEncoder).toBe(3);
  });

  it('returns wav for ios when audio format is wav', () => {
    const result = getRecorderFileInfo('audio/wav', 'ios');

    expect(result.extension).toBe('wav');
    expect(result.mimeType).toBe('audio/wav');
  });

  it('returns mp3 upload info', () => {
    const result = getMp3FileInfo();

    expect(result.extension).toBe('mp3');
    expect(result.mimeType).toBe('audio/mpeg');
  });
});
