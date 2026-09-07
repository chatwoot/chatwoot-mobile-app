import { Platform } from 'react-native';
import { IOSOutputFormat, RecordingPresets } from 'expo-audio';

import { recordedAudioFile, recordingOptionsFor } from '../recordingOptions';

jest.mock('expo-audio', () => ({
  IOSOutputFormat: { LINEARPCM: 'lpcm', MPEG4AAC: 'aac ' },
  RecordingPresets: {
    HIGH_QUALITY: {
      extension: '.m4a',
      sampleRate: 44100,
      numberOfChannels: 2,
      bitRate: 128000,
      android: { outputFormat: 'mpeg4', audioEncoder: 'aac' },
      ios: { outputFormat: 'aac ', audioQuality: 127 },
    },
  },
}));

describe('recordingOptionsFor', () => {
  it('records m4a for channels that accept it', () => {
    Platform.OS = 'ios';
    expect(recordingOptionsFor('audio/m4a')).toBe(RecordingPresets.HIGH_QUALITY);
  });

  it('records PCM wav on iOS when wav is requested', () => {
    Platform.OS = 'ios';
    const options = recordingOptionsFor('audio/wav');

    expect(options.extension).toBe('.wav');
    expect(options.ios?.outputFormat).toBe(IOSOutputFormat.LINEARPCM);
    expect(options.android).toEqual(RecordingPresets.HIGH_QUALITY.android);
  });

  it('always records m4a on android', () => {
    Platform.OS = 'android';
    expect(recordingOptionsFor('audio/wav')).toBe(RecordingPresets.HIGH_QUALITY);
  });
});

describe('recordedAudioFile', () => {
  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(1700000000000);
  });

  it('describes an iOS wav recording', () => {
    Platform.OS = 'ios';
    const file = recordedAudioFile('file:///var/caches/recording.wav', 'audio/wav', 2048);

    expect(file).toEqual({
      uri: 'file:///var/caches/recording.wav',
      originalPath: '/var/caches/recording.wav',
      type: 'audio/wav',
      fileName: 'audio-1700000000000.wav',
      name: 'audio-1700000000000.wav',
      fileSize: 2048,
    });
  });

  it('reports m4a on android whatever format was requested', () => {
    Platform.OS = 'android';
    const file = recordedAudioFile('file:////data/user/0/app/cache/rec.m4a', 'audio/wav', 10);

    expect(file.type).toBe('audio/m4a');
    expect(file.fileName).toBe('audio-1700000000000.m4a');
    expect(file.originalPath).toBe('/data/user/0/app/cache/rec.m4a');
    expect(file.uri).toBe('file:///data/user/0/app/cache/rec.m4a');
  });
});
