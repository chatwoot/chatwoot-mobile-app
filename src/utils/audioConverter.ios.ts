import RNFS from 'react-native-fs';
import { FFmpegKit } from 'ffmpeg-kit-react-native';
import * as Sentry from '@sentry/react-native';

// Conversions in progress, keyed by source url. Two bubbles asking for the same
// audio share one conversion rather than racing over the same files.
const inFlightConversions = new Map<string, Promise<string>>();

const hashUrl = (url: string) => {
  const hash = url.split('').reduce((acc, char) => {
    return ((acc << 5) - acc + char.charCodeAt(0)) | 0;
  }, 0);
  return Math.abs(hash).toString(36);
};

const runConversion = async (oggUrl: string): Promise<string> => {
  // Paths are derived from the url so that concurrent conversions of different
  // audio never share a file. A fixed name let one conversion delete the file
  // another was still using.
  const key = hashUrl(oggUrl);
  const tempOggPath = `${RNFS.CachesDirectoryPath}/audio_${key}.ogg`;
  const outputPath = `${RNFS.CachesDirectoryPath}/audio_${key}.wav`;

  // Replaying audio that has already been converted skips the download.
  if (await RNFS.exists(outputPath)) {
    return `file://${outputPath}`;
  }

  const downloadResult = await RNFS.downloadFile({ fromUrl: oggUrl, toFile: tempOggPath }).promise;

  if (downloadResult.statusCode !== 200) {
    throw new Error(`Download failed with status ${downloadResult.statusCode}`);
  }

  const fileExists = await RNFS.exists(tempOggPath);
  if (!fileExists) {
    throw new Error('Downloaded file not found');
  }

  await FFmpegKit.execute(
    `-i "${tempOggPath}" -vn -y -ar 44100 -ac 2 -c:a pcm_s16le "${outputPath}"`,
  );

  try {
    await RNFS.unlink(tempOggPath);
  } catch {
    // File may already be cleaned up
  }

  const outputExists = await RNFS.exists(outputPath);
  if (!outputExists) {
    throw new Error('Conversion failed - output file not found');
  }

  return `file://${outputPath}`;
};

export const convertOggToWav = async (oggUrl: string): Promise<string> => {
  const existing = inFlightConversions.get(oggUrl);
  if (existing) {
    return existing;
  }

  const conversion = runConversion(oggUrl);
  inFlightConversions.set(oggUrl, conversion);

  try {
    return await conversion;
  } catch (error) {
    Sentry.captureException(error);
    // Rejecting lets the caller show a failure state. Returning the error made
    // it the audio source, which crashed the native player.
    throw error;
  } finally {
    inFlightConversions.delete(oggUrl);
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
