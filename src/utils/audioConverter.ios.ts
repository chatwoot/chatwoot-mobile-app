import RNFS from 'react-native-fs';
import { FFmpegKit } from 'ffmpeg-kit-react-native';
import * as Sentry from '@sentry/react-native';

import { getAudioExtension } from './audioUtils';

/**
 * Downloads a remote audio file and transcodes it to WAV so AVFoundation can
 * play it. Throws when the download or the conversion fails.
 */
export const convertToWav = async (sourceUrl: string): Promise<string> => {
  const sourceExtension = getAudioExtension(sourceUrl) || 'tmp';
  const inputPath = `${RNFS.CachesDirectoryPath}/source_${Date.now()}.${sourceExtension}`;
  const outputPath = `${RNFS.CachesDirectoryPath}/converted_${Date.now()}.wav`;

  try {
    const downloadResult = await RNFS.downloadFile({ fromUrl: sourceUrl, toFile: inputPath })
      .promise;

    if (downloadResult.statusCode !== 200) {
      throw new Error(`Download failed with status ${downloadResult.statusCode}`);
    }

    const fileExists = await RNFS.exists(inputPath);
    if (!fileExists) {
      throw new Error('Downloaded file not found');
    }

    await FFmpegKit.execute(
      `-i "${inputPath}" -vn -y -ar 44100 -ac 2 -c:a pcm_s16le "${outputPath}"`,
    );

    const outputExists = await RNFS.exists(outputPath);
    if (!outputExists) {
      throw new Error('Conversion failed - output file not found');
    }

    return `file://${outputPath}`;
  } catch (error) {
    Sentry.captureException(error);
    throw error;
  } finally {
    try {
      await RNFS.unlink(inputPath);
    } catch {
      // File may already be cleaned up
    }
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
