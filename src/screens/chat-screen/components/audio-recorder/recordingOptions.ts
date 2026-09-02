import { Platform } from 'react-native';
import { IOSOutputFormat, RecordingOptions, RecordingPresets } from 'expo-audio';

export type RecordedAudioFormat = 'audio/m4a' | 'audio/wav';

// Android's MediaRecorder cannot write PCM, so every Android recording is AAC
// in an MP4 container; the channels that reject raw AAC-ADTS all accept it.
const WAV_OPTIONS: RecordingOptions = {
  ...RecordingPresets.HIGH_QUALITY,
  extension: '.wav',
  ios: {
    ...RecordingPresets.HIGH_QUALITY.ios,
    outputFormat: IOSOutputFormat.LINEARPCM,
  },
};

export const recordingOptionsFor = (format: RecordedAudioFormat): RecordingOptions =>
  format === 'audio/wav' && Platform.OS === 'ios' ? WAV_OPTIONS : RecordingPresets.HIGH_QUALITY;

export type RecordedAudioFile = {
  uri: string;
  originalPath: string;
  type: RecordedAudioFormat;
  fileName: string;
  name: string;
  fileSize: number;
};

/** Describes a finished recording the way the message payload expects an attachment. */
export const recordedAudioFile = (
  uri: string,
  requestedFormat: RecordedAudioFormat,
  fileSize: number,
): RecordedAudioFile => {
  const type = Platform.OS === 'ios' ? requestedFormat : 'audio/m4a';
  const extension = type === 'audio/wav' ? 'wav' : 'm4a';
  const fileName = `audio-${Date.now()}.${extension}`;
  const originalPath = uri.replace(/^file:\/+/, '/');
  return {
    uri: `file://${originalPath}`,
    originalPath,
    type,
    fileName,
    name: fileName,
    fileSize,
  };
};
