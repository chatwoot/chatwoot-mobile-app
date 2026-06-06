import { isOggAudioAttachment } from '../attachmentUtils';

describe('attachmentUtils', () => {
  describe('isOggAudioAttachment', () => {
    it('detects OGG audio from content type', () => {
      expect(
        isOggAudioAttachment({
          audioSrc:
            'https://chatwoot.example.com/rails/active_storage/blobs/redirect/token/audio-message',
          contentType: 'audio/ogg; codecs=opus',
        }),
      ).toBe(true);
    });

    it('detects Opus audio from content type', () => {
      expect(
        isOggAudioAttachment({
          audioSrc:
            'https://chatwoot.example.com/rails/active_storage/blobs/redirect/token/audio-message',
          contentType: 'audio/opus',
        }),
      ).toBe(true);
    });

    it('detects OGG audio from extension metadata', () => {
      expect(
        isOggAudioAttachment({
          audioSrc:
            'https://chatwoot.example.com/rails/active_storage/blobs/redirect/token/audio-message',
          extension: 'oga',
        }),
      ).toBe(true);
    });

    it('detects OGG audio from redirected URL paths with query strings', () => {
      expect(
        isOggAudioAttachment({
          audioSrc:
            'https://chatwoot.example.com/rails/active_storage/blobs/redirect/token/audio.ogg?disposition=inline',
        }),
      ).toBe(true);
    });

    it('does not treat m4a audio as OGG audio', () => {
      expect(
        isOggAudioAttachment({
          audioSrc:
            'https://chatwoot.example.com/rails/active_storage/blobs/redirect/token/audio.m4a',
          contentType: 'audio/mp4',
          extension: 'm4a',
        }),
      ).toBe(false);
    });
  });
});
