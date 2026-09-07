import * as FileSystem from 'expo-file-system/legacy';
import { decodeAudioData } from 'react-native-audio-api';
import { fromByteArray } from 'base64-js';
import * as Sentry from '@sentry/react-native';

import {
  AudioAttachmentSource,
  iosNeedsConversion,
  isUnsupportedIosContainer,
  isWebmContainer,
} from '@/utils/audioSource';
import { encodeWav } from '@/utils/wavEncoder';
import { webmToOgg } from '@/utils/webmToOgg';

// Opus voice notes are wideband speech; decoding straight to this rate keeps
// the cached file small without audible loss.
const DECODE_SAMPLE_RATE = 24000;

// Preparations in progress, keyed by source url. Two bubbles asking for the same
// audio share one download rather than racing over the same files.
const inFlightPreparations = new Map<string, Promise<string>>();

const hashUrl = (url: string) => {
  const hash = url.split('').reduce((acc, char) => {
    return ((acc << 5) - acc + char.charCodeAt(0)) | 0;
  }, 0);
  return Math.abs(hash).toString(36);
};

const download = async (url: string): Promise<ArrayBuffer> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Download failed with status ${response.status}`);
  }
  return response.arrayBuffer();
};

const convertToWav = async (bytes: ArrayBuffer, outputPath: string) => {
  // The decoder reads Opus from Ogg but not from WebM, so WebM is re-wrapped
  // into Ogg first; the packets themselves are unchanged.
  const header = new Uint8Array(bytes, 0, 4);
  const decodable = isWebmContainer(header) ? webmToOgg(bytes).buffer : bytes;
  const decoded = await decodeAudioData(decodable as ArrayBuffer, DECODE_SAMPLE_RATE);
  const channels = Array.from({ length: decoded.numberOfChannels }, (_, index) =>
    decoded.getChannelData(index),
  );
  const wav = encodeWav({ sampleRate: decoded.sampleRate, channels });
  await FileSystem.writeAsStringAsync(outputPath, fromByteArray(wav), {
    encoding: FileSystem.EncodingType.Base64,
  });
};

const runPreparation = async (source: AudioAttachmentSource): Promise<string> => {
  const { dataUrl } = source;
  // Paths are derived from the url so that concurrent preparations of different
  // audio never share a file.
  const outputPath = `${FileSystem.cacheDirectory}audio_${hashUrl(dataUrl)}.wav`;

  // Replaying audio that has already been converted skips the download.
  const cached = await FileSystem.getInfoAsync(outputPath);
  if (cached.exists) {
    return outputPath;
  }

  const bytes = await download(dataUrl);

  // Metadata that identifies the container is trusted. Otherwise the first
  // bytes decide; anything AVFoundation can open is streamed from the original
  // url so the player can rely on the server's content type.
  const needsConversion =
    iosNeedsConversion(source) ?? isUnsupportedIosContainer(new Uint8Array(bytes, 0, 4));

  if (!needsConversion) {
    return dataUrl;
  }

  await convertToWav(bytes, outputPath);
  return outputPath;
};

/**
 * Resolves the uri the native player should open for an audio attachment.
 * Sources iOS can play directly resolve to their own url; Ogg/Opus sources are
 * downloaded, decoded to a wav file and resolved to that cached file.
 */
export const preparePlayableAudio = async (source: AudioAttachmentSource): Promise<string> => {
  if (iosNeedsConversion(source) === false) {
    return source.dataUrl;
  }

  const existing = inFlightPreparations.get(source.dataUrl);
  if (existing) {
    return existing;
  }

  const preparation = runPreparation(source);
  inFlightPreparations.set(source.dataUrl, preparation);

  try {
    return await preparation;
  } catch (error) {
    if (__DEV__) {
      console.error('[audio-prepare]', source.dataUrl, error);
    }
    Sentry.captureException(error);
    // Rejecting lets the caller show a failure state. Returning the error made
    // it the audio source, which crashed the native player.
    throw error;
  } finally {
    inFlightPreparations.delete(source.dataUrl);
  }
};
