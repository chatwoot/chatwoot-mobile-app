import RNFS from 'react-native-fs';
import { FFmpegKit, FFprobeKit } from 'ffmpeg-kit-react-native';
import * as Sentry from '@sentry/react-native';
import * as Crypto from 'expo-crypto';

import {
  AudioAttachmentSource,
  iosNeedsConversion,
  isUnsupportedIosContainerFormat,
} from '@/utils/audioSource';

// Preparations in progress, keyed by source url. Two bubbles asking for the same
// audio share one download rather than racing over the same files.
const inFlightPreparations = new Map<string, Promise<string>>();

// SHA-256 of the url: distinct urls get distinct cache files.
const hashUrl = (url: string) => Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, url);

const unlinkQuietly = async (path: string) => {
  try {
    await RNFS.unlink(path);
  } catch {
    // File may already be cleaned up
  }
};

const hasUnsupportedContainer = async (path: string): Promise<boolean> => {
  const session = await FFprobeKit.getMediaInformation(path);
  const format = session.getMediaInformation()?.getFormat();
  return isUnsupportedIosContainerFormat(format);
};

const convertToM4a = async (inputPath: string, outputPath: string) => {
  // AAC in an MP4 container plays natively on iOS and is a fraction of the size
  // of PCM. Channel count and sample rate follow the source.
  await FFmpegKit.execute(`-i "${inputPath}" -vn -y -c:a aac -b:a 64k "${outputPath}"`);

  const outputExists = await RNFS.exists(outputPath);
  if (!outputExists) {
    throw new Error('Conversion failed - output file not found');
  }
};

const runPreparation = async (source: AudioAttachmentSource): Promise<string> => {
  const { dataUrl } = source;
  // Paths are derived from the url so that concurrent preparations of different
  // audio never share a file.
  const key = await hashUrl(dataUrl);
  const downloadPath = `${RNFS.CachesDirectoryPath}/audio_${key}.download`;
  const outputPath = `${RNFS.CachesDirectoryPath}/audio_${key}.m4a`;

  // Replaying audio that has already been converted skips the download.
  if (await RNFS.exists(outputPath)) {
    return `file://${outputPath}`;
  }

  const downloadResult = await RNFS.downloadFile({ fromUrl: dataUrl, toFile: downloadPath })
    .promise;

  if (downloadResult.statusCode !== 200) {
    throw new Error(`Download failed with status ${downloadResult.statusCode}`);
  }

  const fileExists = await RNFS.exists(downloadPath);
  if (!fileExists) {
    throw new Error('Downloaded file not found');
  }

  try {
    // Metadata that identifies the container is trusted. Otherwise ffprobe
    // inspects the downloaded file; anything AVFoundation can open is streamed
    // from the original url so the player can rely on the server's content type.
    const needsConversion =
      iosNeedsConversion(source) ?? (await hasUnsupportedContainer(downloadPath));

    if (!needsConversion) {
      return dataUrl;
    }

    await convertToM4a(downloadPath, outputPath);
    return `file://${outputPath}`;
  } finally {
    await unlinkQuietly(downloadPath);
  }
};

/**
 * Resolves the uri the native player should open for an audio attachment.
 * Sources iOS can play directly resolve to their own url; Ogg/WebM sources are
 * downloaded, converted to m4a and resolved to the cached local file.
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

export const convertAacToWav = async (inputPath: string): Promise<string> => {
  try {
    const fileName = `converted_${Date.now()}.wav`;
    const outputPath = `${RNFS.CachesDirectoryPath}/${fileName}`;

    await FFmpegKit.execute(
      `-i "${inputPath}" -vn -y -ar 44100 -ac 2 -c:a pcm_s16le "${outputPath}"`,
    );

    const outputExists = await RNFS.exists(outputPath);
    if (!outputExists) {
      throw new Error('Conversion failed - output file not found');
    }

    return outputPath; // 👈 Return without file:// prefix
  } catch (error) {
    Sentry.captureException(error);
    throw error;
  }
};
