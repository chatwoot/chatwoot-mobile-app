/**
 * Audio containers AVFoundation cannot decode. Attachments in these formats are
 * transcoded to WAV before playback on iOS.
 *
 * Call recordings are produced by the browser's MediaRecorder and stored as
 * WebM/Opus, so they fall in this list.
 */
const IOS_UNSUPPORTED_AUDIO_EXTENSIONS = ['webm', 'ogg', 'oga', 'opus'];

/**
 * Returns the lowercased extension of the file the URL points at, ignoring the
 * query string and fragment. Attachment URLs are signed and carry parameters
 * after the filename, so the extension cannot be read off the end of the URL.
 */
export const getAudioExtension = (url: string): string => {
  const path = url.split(/[?#]/)[0];
  const fileName = path.substring(path.lastIndexOf('/') + 1);
  const dotIndex = fileName.lastIndexOf('.');
  return dotIndex === -1 ? '' : fileName.substring(dotIndex + 1).toLowerCase();
};

export const isIosUnsupportedAudio = (url: string): boolean =>
  IOS_UNSUPPORTED_AUDIO_EXTENSIONS.includes(getAudioExtension(url));
