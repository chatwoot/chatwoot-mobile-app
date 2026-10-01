import { isRecordedFilePath } from '../audioRecording';

describe('isRecordedFilePath', () => {
  it('accepts an ios file url', () => {
    expect(isRecordedFilePath('file:///var/mobile/Containers/Data/audio.m4a')).toBe(true);
  });

  it('accepts an android absolute path', () => {
    expect(isRecordedFilePath('/data/user/0/com.chatwoot.app/cache/audio-1.aac')).toBe(true);
  });

  it('rejects the status string returned when the recorder is not running', () => {
    expect(isRecordedFilePath('Already stopped')).toBe(false);
  });

  it.each(['No audio playing', 'Already stopped playing', 'set volume'])(
    'rejects the status string %s',
    status => {
      expect(isRecordedFilePath(status)).toBe(false);
    },
  );

  it('rejects a null file url', () => {
    expect(isRecordedFilePath(null)).toBe(false);
    expect(isRecordedFilePath(undefined)).toBe(false);
  });

  it('rejects a remote url', () => {
    expect(isRecordedFilePath('https://chat.example.com/blobs/redirect/file.oga')).toBe(false);
  });
});
