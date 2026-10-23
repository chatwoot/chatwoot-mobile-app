import { Image, Platform } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';

import { startAppRinger, stopAppRinger } from '@/services/voice/chatwootCalls';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const RINGTONE = require('../../assets/ringtone.mp3');

let player: AudioRecorderPlayer | null = null;
let isRinging = false;
// Android rings natively with the phone's own ringtone; the bundled file is the fallback
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

// Loops a ringtone while an inbound call is unanswered. On Android that is the phone's own
// ringtone, played natively. Elsewhere the bundled file plays on the voice note player,
// which is a singleton, so starting it stops any voice note that is playing.
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
    // The player throws when nothing is playing; nothing to clean up in that case.
  }
};
