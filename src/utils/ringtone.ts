import { Image, Platform } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';

import { startAppRinger, stopAppRinger } from '@/services/voice/chatwootCalls';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const RINGTONE = require('../../assets/ringtone.mp3');

let player: AudioRecorderPlayer | null = null;
let isRinging = false;
let ringingNatively = false;

const ringtoneUri = () => Image.resolveAssetSource(RINGTONE)?.uri;

const playOnce = async () => {
  if (!isRinging || !player) return;
  const uri = ringtoneUri();
  if (!uri) return;
  await player.startPlayer(uri);
  player.addPlayBackListener(event => {
    if (event.currentPosition >= event.duration) {
      player?.removePlayBackListener();
      player?.stopPlayer().catch(() => {});
      if (isRinging) {
        playOnce().catch(() => {});
      }
    }
  });
};

export const startRingtone = async () => {
  if (isRinging) return;
  isRinging = true;
  if (Platform.OS === 'android' && startAppRinger()) {
    ringingNatively = true;
    return;
  }
  player = player || new AudioRecorderPlayer();
  try {
    await playOnce();
  } catch {
    isRinging = false;
  }
};

export const stopRingtone = async () => {
  if (!isRinging) return;
  isRinging = false;
  if (ringingNatively) {
    ringingNatively = false;
    stopAppRinger();
    return;
  }
  try {
    player?.removePlayBackListener();
    await player?.stopPlayer();
  } catch {
    // Already-stopped players can reject stop requests.
  }
};
