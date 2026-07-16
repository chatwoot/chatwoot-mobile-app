/**
 * This code was taken from https://github.com/GetStream/react-native-samples/blob/main/projects/WhatsAppClone/src/utils/AudioManager.ts
 * All credits goes the Awesome Developer [@vanGalilea](https://github.com/vanGalilea/vanGalilea)
 */

import AudioRecorderPlayer, { PlayBackType } from 'react-native-audio-recorder-player';

export type Callback = (args: { status: AudioStatus; data?: PlayBackType }) => void;

export enum AudioStatus {
  PLAYING = 'PLAYING',
  STARTED = 'STARTED',
  PAUSED = 'PAUSED',
  RESUMED = 'RESUMED',
  STOPPED = 'STOPPED',
}

// Thrown by startPlayer when a newer start (or a stop) replaced it while the
// native player was still preparing. Callers should treat it as "did not
// start" and must not claim playback.
export class StartSupersededError extends Error {
  constructor() {
    super('Audio start superseded by a newer playback request');
    this.name = 'StartSupersededError';
  }
}

let audioRecorderPlayer: AudioRecorderPlayer | undefined;
let currentCallback: Callback = () => {};
// Bumped on every start/stop so a start that is still awaiting the native
// player can detect it was superseded and avoid touching the replaced player.
let activeGeneration = 0;

export const startPlayer = async (path: string, callback: Callback) => {
  // Always tear down any existing player so playback begins from a clean state,
  // bound to the current caller's callback with exactly one playback listener.
  // Resuming a paused clip goes through resumePlayer, never through startPlayer.
  if (audioRecorderPlayer !== undefined) {
    await stopPlayer();
  }

  const generation = ++activeGeneration;
  currentCallback = callback;

  const player = new AudioRecorderPlayer();
  audioRecorderPlayer = player;
  player.setSubscriptionDuration(0.1);

  await player.startPlayer(path);

  // A newer start (or a stop) superseded this one while the native player was
  // preparing. Reject rather than resolve so callers don't treat a cancelled
  // start as success and claim playback for a clip that never started.
  if (generation !== activeGeneration) {
    throw new StartSupersededError();
  }

  currentCallback({
    status: AudioStatus.STARTED,
  });
  player.addPlayBackListener(async e => {
    if (generation !== activeGeneration) {
      return;
    }
    // Use >= with a positive duration so completion still fires when the native
    // position never lands exactly on the reported duration (common on Android).
    if (e.duration > 0 && e.currentPosition >= e.duration) {
      currentCallback({
        status: AudioStatus.STOPPED,
        data: e,
      });
      await stopPlayer();
    } else {
      currentCallback({
        status: AudioStatus.PLAYING,
        data: e,
      });
    }
    return;
  });
};

export const pausePlayer = async () => {
  await audioRecorderPlayer?.pausePlayer();
  currentCallback({ status: AudioStatus.PAUSED });
};

export const resumePlayer = async () => {
  await audioRecorderPlayer?.resumePlayer();
  currentCallback({ status: AudioStatus.RESUMED });
};

export const seekTo = async (position: number) => {
  await audioRecorderPlayer?.seekToPlayer(position);
  currentCallback({ status: AudioStatus.PLAYING });
};

export const stopPlayer = async () => {
  // Invalidate any in-flight start so it does not re-attach to this player.
  activeGeneration++;
  await audioRecorderPlayer?.stopPlayer();
  audioRecorderPlayer?.removePlayBackListener();
  currentCallback({ status: AudioStatus.STOPPED });
  audioRecorderPlayer = undefined;
};
