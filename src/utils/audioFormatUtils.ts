export type RecorderAudioFormat = 'audio/m4a' | 'audio/wav';
export type RecorderPlatform = 'ios' | 'android';

type RecorderFileInfo = {
  extension: 'm4a' | 'aac' | 'wav';
  mimeType: 'audio/m4a' | 'audio/aac' | 'audio/wav';
  androidOutputFormat?: number;
  androidAudioEncoder?: number;
};

type Mp3FileInfo = {
  extension: 'mp3';
  mimeType: 'audio/mpeg';
};

export const getRecorderFileInfo = (
  audioFormat: RecorderAudioFormat,
  platform: RecorderPlatform,
): RecorderFileInfo => {
  if (platform === 'android') {
    if (audioFormat === 'audio/m4a') {
      return {
        extension: 'm4a',
        mimeType: 'audio/m4a',
        androidOutputFormat: 2, // MediaRecorder.OutputFormat.MPEG_4
        androidAudioEncoder: 3, // MediaRecorder.AudioEncoder.AAC
      };
    }
    return {
      extension: 'aac',
      mimeType: 'audio/aac',
      androidOutputFormat: 6, // MediaRecorder.OutputFormat.AAC_ADTS
      androidAudioEncoder: 3, // MediaRecorder.AudioEncoder.AAC
    };
  }

  if (audioFormat === 'audio/wav') {
    return {
      extension: 'wav',
      mimeType: 'audio/wav',
    };
  }

  return {
    extension: 'm4a',
    mimeType: 'audio/m4a',
  };
};

export const getMp3FileInfo = (): Mp3FileInfo => ({
  extension: 'mp3',
  mimeType: 'audio/mpeg',
});
