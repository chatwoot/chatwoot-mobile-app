/**
 * This code was taken from https://github.com/GetStream/react-native-samples/blob/main/projects/WhatsAppClone/src/utils/AudioManager.ts
 * All credits goes the Awesome Developer [@vanGalilea](https://github.com/vanGalilea/vanGalilea)
 */

import AudioRecorderPlayer, { PlayBackType } from 'react-native-audio-recorder-player';

export type Callback = (args: { status: AudioStatus; data?: PlayBackType }) => void;

type Path = string | undefined;

export enum AudioStatus {
  PLAYING = 'PLAYING',
  STARTED = 'STARTED',
  PAUSED = 'PAUSED',
  RESUMED = 'RESUMED',
  STOPPED = 'STOPPED',
}

let audioRecorderPlayer: AudioRecorderPlayer | undefined;
let currentPath: Path;
let currentCallback: Callback = () => {};

export const startPlayer = async (path: string, callback: Callback) => {
  // Always tear down any existing player so playback begins from a clean state,
  // bound to the current caller's callback with exactly one playback listener.
  // Resuming a paused clip goes through resumePlayer, never through startPlayer.
  if (audioRecorderPlayer !== undefined) {
    await stopPlayer();
  }

  currentPath = path;
  currentCallback = callback;

  audioRecorderPlayer = new AudioRecorderPlayer();
  audioRecorderPlayer.setSubscriptionDuration(0.1);

  await audioRecorderPlayer.startPlayer(currentPath);
  currentCallback({
    status: AudioStatus.STARTED,
  });
  audioRecorderPlayer.addPlayBackListener(async e => {
    if (e.currentPosition === e.duration) {
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
  await audioRecorderPlayer?.stopPlayer();
  audioRecorderPlayer?.removePlayBackListener();
  currentCallback({ status: AudioStatus.STOPPED });
  audioRecorderPlayer = undefined;
  currentPath = undefined;
};
