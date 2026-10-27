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
let cutOff = false;

// Interrupted playback can report premature completion.
const CUT_OFF_GAP_MS = 1500;

const play = async (path: string, from = 0) => {
  cutOff = false;
  const player = new AudioRecorderPlayer();
  audioRecorderPlayer = player;
  await player.startPlayer(path);
  if (from > 0) await player.seekToPlayer(from);
  player.addPlayBackListener(async e => {
    if (e.currentPosition === e.duration) {
      if (currentPosition > 0 && e.duration - currentPosition > CUT_OFF_GAP_MS) {
        const stoppedAt = currentPosition;
        if (!(await releasePlayer(player))) return;
        currentPosition = stoppedAt;
        cutOff = true;
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

const releasePlayer = async (player: AudioRecorderPlayer) => {
  await player.stopPlayer().catch(() => {});
  player.removePlayBackListener();
  if (audioRecorderPlayer !== player) return false;
  audioRecorderPlayer = undefined;
  return true;
};

export const startPlayer = async (path: string, callback: Callback) => {
  if (currentPath === undefined) {
    currentPath = path;
    currentCallback = callback;
  } else if (currentPath !== path) {
    if (audioRecorderPlayer !== undefined) {
      await stopPlayer();
    } else {
      currentPosition = 0;
      currentCallback({ status: AudioStatus.STOPPED });
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
  if (!audioRecorderPlayer && currentPath && cutOff) {
    await play(currentPath, currentPosition);
  } else {
    await audioRecorderPlayer?.resumePlayer();
  }
  currentCallback({ status: AudioStatus.RESUMED });
};

// Seek completion can precede progress events.
export const seekTo = async (position: number) => {
  currentPosition = position;
  await audioRecorderPlayer?.seekToPlayer(position);
  currentCallback({ status: AudioStatus.PLAYING });
};

export const stopPlayer = async () => {
  cutOff = false;
  await audioRecorderPlayer?.stopPlayer();
  audioRecorderPlayer?.removePlayBackListener();
  currentPosition = 0;
  currentCallback({ status: AudioStatus.STOPPED });
  audioRecorderPlayer = undefined;
};
