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

// Progress arrives a few times a second, so a note that reports its end while the last
// position was further off than this was cut off, not finished: the phone switching its
// audio when a call ends does this
const CUT_OFF_GAP_MS = 1500;

const play = async (path: string, from = 0) => {
  audioRecorderPlayer = new AudioRecorderPlayer();
  await audioRecorderPlayer.startPlayer(path);
  if (from > 0) await audioRecorderPlayer.seekToPlayer(from);
  audioRecorderPlayer.addPlayBackListener(async e => {
    if (e.currentPosition === e.duration) {
      if (currentPosition > 0 && e.duration - currentPosition > CUT_OFF_GAP_MS) {
        // Paused where it stopped, so play carries on from there
        const stoppedAt = currentPosition;
        await releasePlayer();
        currentPosition = stoppedAt;
        currentCallback({ status: AudioStatus.PAUSED, data: { ...e, currentPosition: stoppedAt } });
        return;
      }
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
  });
};

// Drops the native player but keeps the note and its position
const releasePlayer = async () => {
  await audioRecorderPlayer?.stopPlayer().catch(() => {});
  audioRecorderPlayer?.removePlayBackListener();
  audioRecorderPlayer = undefined;
};

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

  const shouldBeResumed = currentPath === path && currentPosition > 0;

  if (shouldBeResumed) {
    await resumePlayer();
    return;
  }

  await play(path);
  currentCallback({
    status: AudioStatus.STARTED,
  });
};

export const pausePlayer = async () => {
  await audioRecorderPlayer?.pausePlayer();
  currentCallback({ status: AudioStatus.PAUSED });
};

export const resumePlayer = async () => {
  // A note that was cut off has no player left; a new one starts where it stopped
  if (!audioRecorderPlayer && currentPath && currentPosition > 0) {
    await play(currentPath, currentPosition);
  } else {
    await audioRecorderPlayer?.resumePlayer();
  }
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
