import { getAudioExtension, isIosUnsupportedAudio } from '@/utils/audioUtils';

const CALL_RECORDING_URL =
  'https://example.com/rails/active_storage/blobs/redirect/token--signature/call-recording.webm?disposition=inline';

describe('getAudioExtension', () => {
  it('should return the extension of a plain url', () => {
    expect(getAudioExtension('https://example.com/audio.ogg')).toBe('ogg');
  });

  it('should ignore the query string', () => {
    expect(getAudioExtension(CALL_RECORDING_URL)).toBe('webm');
  });

  it('should ignore the fragment', () => {
    expect(getAudioExtension('https://example.com/audio.opus#t=10')).toBe('opus');
  });

  it('should lowercase the extension', () => {
    expect(getAudioExtension('https://example.com/AUDIO.OGG')).toBe('ogg');
  });

  it('should return an empty string when there is no extension', () => {
    expect(getAudioExtension('https://example.com/blobs/redirect/abc123')).toBe('');
  });

  it('should not treat a dot in an earlier path segment as an extension', () => {
    expect(getAudioExtension('https://example.com/v1.2/recording')).toBe('');
  });
});

describe('isIosUnsupportedAudio', () => {
  it.each(['webm', 'ogg', 'oga', 'opus'])('should flag %s for conversion', extension => {
    expect(isIosUnsupportedAudio(`https://example.com/audio.${extension}`)).toBe(true);
  });

  it('should flag a signed call recording url', () => {
    expect(isIosUnsupportedAudio(CALL_RECORDING_URL)).toBe(true);
  });

  it.each(['mp3', 'm4a', 'wav', 'aac'])('should not flag %s', extension => {
    expect(isIosUnsupportedAudio(`https://example.com/audio.${extension}`)).toBe(false);
  });

  it('should not flag a url without an extension', () => {
    expect(isIosUnsupportedAudio('https://example.com/blobs/redirect/abc123')).toBe(false);
  });
});
