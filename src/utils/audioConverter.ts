import { Platform } from 'react-native';

// Platform-specific audio converter imports
import * as iOSAudioConverter from './audioConverter.ios';
import * as AndroidAudioConverter from './audioConverter.android';

// Re-export the appropriate platform-specific functions
export const convertOggToWav =
  Platform.OS === 'ios' ? iOSAudioConverter.convertOggToWav : AndroidAudioConverter.convertOggToWav;

export const convertAacToWav =
  Platform.OS === 'ios' ? iOSAudioConverter.convertAacToWav : AndroidAudioConverter.convertAacToWav;
