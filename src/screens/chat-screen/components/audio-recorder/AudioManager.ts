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
// Monotonic token identifying the most recent playback request. Reserved at
// intent time (the tap) so callers that defer their startPlayer to a later
// frame still order correctly against callers that start immediately: whichever
// tap is newest holds the latest token and wins, regardless of call timing.
let latestToken = 0;

// Reserve a playback token synchronously. Deferred callers must reserve at the
// moment of intent and pass the token to startPlayer; immediate callers can
// rely on startPlayer's default, which reserves at call time.
export const reservePlayback = (): number => ++latestToken;

export const startPlayer = async (
  path: string,
  callback: Callback,
  token: number = ++latestToken,
) => {
  // A newer request superseded this one before it began — e.g. it sat in a
  // deferred frame while another control started playback. Reject so the caller
  // does not claim playback for a clip that never started.
  if (token !== latestToken) {
    throw new StartSupersededError();
  }

  // Always tear down any existing player so playback begins from a clean state,
  // bound to the current caller's callback with exactly one playback listener.
  // Resuming a paused clip goes through resumePlayer, never through startPlayer.
  if (audioRecorderPlayer !== undefined) {
    await stopPlayer();
  }

  currentCallback = callback;

  const player = new AudioRecorderPlayer();
  audioRecorderPlayer = player;
  player.setSubscriptionDuration(0.1);

  await player.startPlayer(path);

  // A newer request superseded this one while the native player was preparing.
  if (token !== latestToken) {
    throw new StartSupersededError();
  }

  currentCallback({
    status: AudioStatus.STARTED,
  });
  player.addPlayBackListener(async e => {
    // Ignore stray callbacks from a player that has since been replaced.
    if (audioRecorderPlayer !== player) {
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
  // Detach synchronously so any queued listener callback for this player is
  // ignored, and so a concurrent start knows the player was replaced. Stopping
  // does not bump latestToken — a stop must not supersede a queued start.
  const player = audioRecorderPlayer;
  audioRecorderPlayer = undefined;
  await player?.stopPlayer();
  player?.removePlayBackListener();
  currentCallback({ status: AudioStatus.STOPPED });
};
