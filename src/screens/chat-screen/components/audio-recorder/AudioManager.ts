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
let currentPosition = 0;

export const startPlayer = async (path: string, callback: Callback) => {
  if (currentPath === undefined) {
    currentPath = path;
    currentCallback = callback;
  } else if (currentPath !== path) {
    if (audioRecorderPlayer !== undefined) {
      await stopPlayer();
    }
    currentPath = path;
    currentCallback = callback;
  }

  if (audioRecorderPlayer === undefined) {
    audioRecorderPlayer = new AudioRecorderPlayer();
  }

  const shouldBeResumed = currentPath === path && currentPosition > 0;

  if (shouldBeResumed) {
    await audioRecorderPlayer.resumePlayer();
    currentCallback({
      status: AudioStatus.RESUMED,
    });
    return;
  }

  await audioRecorderPlayer.startPlayer(currentPath);
  currentCallback({
    status: AudioStatus.STARTED,
  });
  audioRecorderPlayer.addPlayBackListener(async e => {
    // On Android, the first event for streamed media (most visibly OGG voice
    // notes from web/Android senders) arrives with currentPosition=0 AND
    // duration=0 before the file's metadata is loaded. The raw equality
    // check (0 === 0) immediately tripped the "audio ended" path and tore
    // the player down, so the user saw the spinner flash and no sound.
    // Guard with `duration > 0` so end-of-playback only fires once we
    // actually know the duration.
    if (e.duration > 0 && e.currentPosition >= e.duration) {
      currentCallback({
        status: AudioStatus.STOPPED,
        data: e,
      });
      await stopPlayer();
    } else {
      currentPosition = e.currentPosition;
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
  currentPosition = 0;
  currentCallback({ status: AudioStatus.STOPPED });
  audioRecorderPlayer = undefined;
};
