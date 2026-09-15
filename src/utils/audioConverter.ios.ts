import RNFS from 'react-native-fs';
import { FFmpegKit, FFprobeKit, ReturnCode } from 'ffmpeg-kit-react-native';
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

// Urls whose downloaded bytes ffprobe found natively playable. They stream
// from the original url and are not downloaded again this session.
const nativeSources = new Set<string>();

// Bumped whenever the ffmpeg parameters change so cached output is regenerated.
const CACHE_VERSION = 1;

// SHA-256 of the url: distinct urls get distinct cache files.
const hashUrl = (url: string) => Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, url);

// Files the sweep removes: the previous converter's fixed temp file, recorder
// output, and this converter's download and interrupted-conversion files.
const LEGACY_FILE_PATTERN =
  /^(temp\.ogg|converted_\d+\.wav(\.partial)?|audio_[a-z0-9]+\.download|audio_[a-z0-9]+_v\d+\.m4a\.partial)$/;

export const isSweepableAudioFile = (name: string) => LEGACY_FILE_PATTERN.test(name);
const LEGACY_MAX_AGE_MS = 24 * 60 * 60 * 1000;

// Removes stale temp and legacy conversion files from the cache directory.
// Files younger than a day are left alone: a recording may still be uploading.
const sweepLegacyFiles = async () => {
  try {
    const entries = await RNFS.readDir(RNFS.CachesDirectoryPath);
    const cutoff = Date.now() - LEGACY_MAX_AGE_MS;
    await Promise.all(
      entries
        .filter(entry => isSweepableAudioFile(entry.name))
        .filter(entry => (entry.mtime?.getTime() ?? 0) < cutoff)
        .map(entry => unlinkQuietly(entry.path)),
    );
  } catch {
    // The sweep is best effort.
  }
};
let legacySweep: Promise<void> | null = null;

const unlinkQuietly = async (path: string) => {
  try {
    await RNFS.unlink(path);
  } catch {
    // File may already be cleaned up
  }
};

const hasUnsupportedContainer = async (path: string): Promise<boolean> => {
  const session = await FFprobeKit.getMediaInformation(path);
  const information = session.getMediaInformation();
  if (!information) {
    throw new Error('Downloaded audio could not be inspected');
  }
  return isUnsupportedIosContainerFormat(information.getFormat());
};

// Runs ffmpeg with `inputArgs` writing `format` to a partial file, and moves
// it to `outputPath` only when the session succeeds. A failed or interrupted
// run therefore never leaves a file at the output path.
const runFfmpeg = async (inputArgs: string, format: string, outputPath: string) => {
  const partialPath = `${outputPath}.partial`;
  const session = await FFmpegKit.execute(`${inputArgs} -y -f ${format} "${partialPath}"`);
  const returnCode = await session.getReturnCode();

  if (!ReturnCode.isSuccess(returnCode)) {
    await unlinkQuietly(partialPath);
    throw new Error(`Conversion failed with ffmpeg return code ${returnCode?.getValue()}`);
  }

  await RNFS.moveFile(partialPath, outputPath);
};

const convertToM4a = (inputPath: string, outputPath: string) =>
  // AAC in an MP4 container plays natively on iOS and is a fraction of the size
  // of PCM. Channel count and sample rate follow the source.
  runFfmpeg(`-i "${inputPath}" -vn -c:a aac -b:a 128k`, 'mp4', outputPath);

const runPreparation = async (source: AudioAttachmentSource): Promise<string> => {
  const { dataUrl } = source;
  // Paths are derived from the url so that concurrent preparations of different
  // audio never share a file.
  if (nativeSources.has(dataUrl)) {
    return dataUrl;
  }

  legacySweep ??= sweepLegacyFiles();

  const key = await hashUrl(dataUrl);
  const downloadPath = `${RNFS.CachesDirectoryPath}/audio_${key}.download`;
  const outputPath = `${RNFS.CachesDirectoryPath}/audio_${key}_v${CACHE_VERSION}.m4a`;

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
      nativeSources.add(dataUrl);
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
    // Rejecting lets the caller show a failure state.
    throw error;
  } finally {
    inFlightPreparations.delete(source.dataUrl);
  }
};

export const convertAacToWav = async (inputPath: string): Promise<string> => {
  try {
    const fileName = `converted_${Date.now()}.wav`;
    const outputPath = `${RNFS.CachesDirectoryPath}/${fileName}`;

    await runFfmpeg(`-i "${inputPath}" -vn -ar 44100 -ac 2 -c:a pcm_s16le`, 'wav', outputPath);

    // Returned without a file:// prefix; the caller adds it per platform.
    return outputPath;
  } catch (error) {
    Sentry.captureException(error);
    throw error;
  }
};
