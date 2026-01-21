import { Platform } from 'react-native';
import { convertOggToWav as convertOggToWavIOS } from './audioConverter.ios';
import { convertAacToWav as convertAacToWavAndroid } from './audioConverter.android';

export const convertOggToWav: (oggUrl: string) => Promise<string> =
  Platform.OS === 'ios'
    ? convertOggToWavIOS
    : () => {
        throw new Error('Not implemented on this platform');
      };
export const convertAacToWav = Platform.OS === 'android' ? convertAacToWavAndroid : () => { throw new Error('Not implemented on this platform'); };
