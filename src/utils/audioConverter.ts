import { Platform } from 'react-native';
import { convertOggToWav as convertOggToWavIOS } from './audioConverter.ios';
import { convertAacToWav as convertAacToWavAndroid } from './audioConverter.android';
import { convertAacToWav as convertAacToWavIos } from './audioConverter.ios'; // Import iOS specific AAC converter.

export const convertOggToWav: (oggUrl: string) => Promise<string> =
  Platform.OS === 'ios'
    ? convertOggToWavIOS
    : () => {
        throw new Error('Not implemented on this platform');
      };
export const convertAacToWav = Platform.OS === 'android' ? convertAacToWavAndroid : Platform.OS === 'ios' ? convertAacToWavIos : () => { throw new Error('Not implemented on this platform'); };
