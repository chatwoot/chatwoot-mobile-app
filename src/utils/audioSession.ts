import { AudioMode, setAudioModeAsync } from 'expo-audio';
import * as Sentry from '@sentry/react-native';

// Voice notes play through the speaker even with the ringer switch on silent,
// as in every messaging app. `allowsRecording` is only raised while the
// recorder is open: on iOS it switches the session to play-and-record, which
// routes playback to the earpiece until it is lowered again.
const PLAYBACK_MODE: Partial<AudioMode> = { playsInSilentMode: true, allowsRecording: false };
const RECORDING_MODE: Partial<AudioMode> = { playsInSilentMode: true, allowsRecording: true };

let appliedMode: Partial<AudioMode> | null = null;
let pending: Promise<void> = Promise.resolve();

const applyAudioMode = (mode: Partial<AudioMode>): Promise<void> => {
  if (appliedMode === mode) {
    return pending;
  }
  appliedMode = mode;
  pending = pending
    .then(() => setAudioModeAsync(mode))
    .catch(error => {
      appliedMode = null;
      Sentry.captureException(error);
    });
  return pending;
};

export const ensurePlaybackAudioMode = () => applyAudioMode(PLAYBACK_MODE);

export const enableRecordingAudioMode = () => applyAudioMode(RECORDING_MODE);

export const disableRecordingAudioMode = () => applyAudioMode(PLAYBACK_MODE);
