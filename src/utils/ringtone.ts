import { Image } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const RINGTONE = require('../../assets/ringtone.mp3');

let player: AudioRecorderPlayer | null = null;
let isRinging = false;

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

// Loops the in-app ringtone while an inbound call is unanswered. The native player is a
// singleton, so starting the ringtone stops any voice note that is playing.
export const startRingtone = async () => {
  if (isRinging) return;
  isRinging = true;
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
  try {
    player?.removePlayBackListener();
    await player?.stopPlayer();
  } catch {
    // The player throws when nothing is playing; nothing to clean up in that case.
  }
};
