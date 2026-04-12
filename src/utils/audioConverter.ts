import { Platform } from 'react-native';

import {
  convertAacToWav as convertAacToWavAndroid,
  convertOggToWav as convertOggToWavAndroid,
} from './audioConverter.android';
import {
  convertAacToWav as convertAacToWavIos,
  convertOggToWav as convertOggToWavIos,
} from './audioConverter.ios';

export const convertOggToWav = (oggUrl: string) => {
  return Platform.OS === 'ios' ? convertOggToWavIos(oggUrl) : convertOggToWavAndroid(oggUrl);
};

export const convertAacToWav = (inputPath: string) => {
  return Platform.OS === 'ios' ? convertAacToWavIos(inputPath) : convertAacToWavAndroid(inputPath);
};
