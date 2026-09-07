import { setAudioModeAsync } from 'expo-audio';
import * as Sentry from '@sentry/react-native';

export type PlaybackOwner = {
  pause: () => void;
};

let activeOwner: PlaybackOwner | null = null;
let audioModeReady: Promise<void> | null = null;

// Voice notes play through the speaker even with the ringer switch on silent,
// as in every messaging app. This is the only audio-session setting playback
// needs; the recorder configures its own session when it starts.
export const ensurePlaybackAudioMode = (): Promise<void> => {
  if (!audioModeReady) {
    audioModeReady = setAudioModeAsync({ playsInSilentMode: true }).catch(error => {
      audioModeReady = null;
      Sentry.captureException(error);
    });
  }
  return audioModeReady;
};

/** Makes `owner` the only bubble playing; whichever owner held playback is paused. */
export const claimPlayback = (owner: PlaybackOwner) => {
  if (activeOwner && activeOwner !== owner) {
    activeOwner.pause();
  }
  activeOwner = owner;
};

export const releasePlayback = (owner: PlaybackOwner) => {
  if (activeOwner === owner) {
    activeOwner = null;
  }
};
