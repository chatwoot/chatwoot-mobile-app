import {
  getUrlExtension,
  iosNeedsConversion,
  isUnsupportedIosContainerFormat,
} from '@/utils/audioSource';

const REDIRECT = 'https://app.chatwoot.com/rails/active_storage/blobs/redirect/abc123';

describe('getUrlExtension', () => {
  it('reads the extension of the last path segment', () => {
    expect(getUrlExtension(`${REDIRECT}/voice.oga`)).toBe('oga');
  });

  it('ignores query strings and fragments', () => {
    expect(getUrlExtension(`${REDIRECT}/voice.OGG?disposition=inline#t`)).toBe('ogg');
  });

  it('returns null for extensionless filenames', () => {
    expect(getUrlExtension(`${REDIRECT}/01sdhn`)).toBeNull();
    expect(getUrlExtension(`${REDIRECT}/.hidden`)).toBeNull();
    expect(getUrlExtension(`${REDIRECT}/trailing.`)).toBeNull();
  });
});

describe('iosNeedsConversion', () => {
  it('converts WhatsApp voice notes served as .oga', () => {
    expect(iosNeedsConversion({ dataUrl: `${REDIRECT}/voice.oga` })).toBe(true);
  });

  it('converts dashboard recordings served as .ogg', () => {
    expect(
      iosNeedsConversion({ dataUrl: `${REDIRECT}/recording.ogg`, contentType: 'audio/ogg' }),
    ).toBe(true);
  });

  it('trusts the content type over a misleading extension', () => {
    // Evolution API registers Opus notes with an mp3 extension and audio/opus type.
    expect(
      iosNeedsConversion({
        dataUrl: `${REDIRECT}/voice.mp3`,
        extension: 'mp3',
        contentType: 'audio/opus',
      }),
    ).toBe(true);
  });

  it('converts extensionless files whose content type is ogg', () => {
    expect(iosNeedsConversion({ dataUrl: `${REDIRECT}/01sdhn`, contentType: 'audio/ogg' })).toBe(
      true,
    );
  });

  it('handles content types with codec parameters and mixed case', () => {
    expect(
      iosNeedsConversion({ dataUrl: `${REDIRECT}/x`, contentType: 'Audio/OGG; codecs=opus' }),
    ).toBe(true);
  });

  it('converts WebM recordings', () => {
    expect(iosNeedsConversion({ dataUrl: `${REDIRECT}/x`, contentType: 'audio/webm' })).toBe(true);
    expect(iosNeedsConversion({ dataUrl: `${REDIRECT}/note.webm` })).toBe(true);
  });

  it('plays natively supported audio types directly', () => {
    expect(iosNeedsConversion({ dataUrl: `${REDIRECT}/a.mp3`, contentType: 'audio/mpeg' })).toBe(
      false,
    );
    expect(iosNeedsConversion({ dataUrl: `${REDIRECT}/a.m4a`, contentType: 'audio/x-m4a' })).toBe(
      false,
    );
    expect(iosNeedsConversion({ dataUrl: `${REDIRECT}/a.wav`, contentType: 'audio/wav' })).toBe(
      false,
    );
  });

  it('plays known extensions directly when no content type is available', () => {
    expect(iosNeedsConversion({ dataUrl: `${REDIRECT}/audio-1.m4a` })).toBe(false);
    expect(iosNeedsConversion({ dataUrl: `${REDIRECT}/x`, extension: 'aac' })).toBe(false);
  });

  it('converts wma and matroska content types', () => {
    expect(iosNeedsConversion({ dataUrl: `${REDIRECT}/x`, contentType: 'audio/x-ms-wma' })).toBe(
      true,
    );
    expect(iosNeedsConversion({ dataUrl: `${REDIRECT}/x`, contentType: 'audio/x-matroska' })).toBe(
      true,
    );
    expect(iosNeedsConversion({ dataUrl: `${REDIRECT}/note.wma` })).toBe(true);
    expect(iosNeedsConversion({ dataUrl: `${REDIRECT}/note.ra` })).toBe(true);
    expect(
      iosNeedsConversion({ dataUrl: `${REDIRECT}/x`, contentType: 'audio/x-pn-realaudio' }),
    ).toBe(true);
  });

  it('leaves unrecognised audio types to the file header', () => {
    expect(
      iosNeedsConversion({ dataUrl: `${REDIRECT}/x`, contentType: 'audio/x-unknown' }),
    ).toBeUndefined();
  });

  it('converts webm-audio and matroska extensions', () => {
    expect(iosNeedsConversion({ dataUrl: `${REDIRECT}/note.weba` })).toBe(true);
    expect(iosNeedsConversion({ dataUrl: `${REDIRECT}/note.mka` })).toBe(true);
  });

  it('leaves the decision to the file header when metadata says nothing', () => {
    expect(iosNeedsConversion({ dataUrl: `${REDIRECT}/01sdhn` })).toBeUndefined();
    expect(iosNeedsConversion({ dataUrl: `${REDIRECT}/note.bin` })).toBeUndefined();
    expect(iosNeedsConversion({ dataUrl: `${REDIRECT}/x`, extension: 'mkv' })).toBeUndefined();
    expect(
      iosNeedsConversion({
        dataUrl: `${REDIRECT}/01sdhn`,
        contentType: 'application/octet-stream',
      }),
    ).toBeUndefined();
  });
});

describe('isUnsupportedIosContainerFormat', () => {
  it('treats every container outside the native set as unsupported', () => {
    expect(isUnsupportedIosContainerFormat('ogg')).toBe(true);
    expect(isUnsupportedIosContainerFormat('matroska,webm')).toBe(true);
    expect(isUnsupportedIosContainerFormat('asf')).toBe(true);
    expect(isUnsupportedIosContainerFormat('rm')).toBe(true);
    expect(isUnsupportedIosContainerFormat('mpegts')).toBe(true);
  });

  it('accepts natively playable formats', () => {
    expect(isUnsupportedIosContainerFormat('mp3')).toBe(false);
    expect(isUnsupportedIosContainerFormat('mov,mp4,m4a,3gp,3g2,mj2')).toBe(false);
    expect(isUnsupportedIosContainerFormat('wav')).toBe(false);
    expect(isUnsupportedIosContainerFormat('aac')).toBe(false);
    expect(isUnsupportedIosContainerFormat('flac')).toBe(false);
    expect(isUnsupportedIosContainerFormat(null)).toBe(false);
    expect(isUnsupportedIosContainerFormat(undefined)).toBe(false);
  });
});
