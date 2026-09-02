import {
  getUrlExtension,
  iosNeedsConversion,
  isUnsupportedIosContainer,
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
    // CW-7275: Evolution API notes registered with extension mp3 and audio/opus.
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

  it('leaves the decision to the file header when metadata says nothing', () => {
    expect(iosNeedsConversion({ dataUrl: `${REDIRECT}/01sdhn` })).toBeUndefined();
    expect(
      iosNeedsConversion({
        dataUrl: `${REDIRECT}/01sdhn`,
        contentType: 'application/octet-stream',
      }),
    ).toBeUndefined();
  });
});

describe('isUnsupportedIosContainer', () => {
  const bytes = (...values: number[]) => new Uint8Array(values);

  it('recognises the Ogg and WebM magic bytes', () => {
    expect(isUnsupportedIosContainer(bytes(0x4f, 0x67, 0x67, 0x53, 0x00))).toBe(true);
    expect(isUnsupportedIosContainer(bytes(0x1a, 0x45, 0xdf, 0xa3))).toBe(true);
  });

  it('rejects other headers and short buffers', () => {
    expect(isUnsupportedIosContainer(bytes(0x49, 0x44, 0x33, 0x04))).toBe(false); // ID3
    expect(isUnsupportedIosContainer(bytes(0x52, 0x49, 0x46, 0x46))).toBe(false); // RIFF
    expect(isUnsupportedIosContainer(bytes(0x4f, 0x67))).toBe(false);
    expect(isUnsupportedIosContainer(bytes())).toBe(false);
  });
});
