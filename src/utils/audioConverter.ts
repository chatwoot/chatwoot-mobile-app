import RNFS from 'react-native-fs';
import { FFmpegKit } from 'ffmpeg-kit-react-native';
import * as Sentry from '@sentry/react-native';

export const convertOggToMp3 = async (oggUrl: string): Promise<string> => {
  const tempOggPath = `${RNFS.CachesDirectoryPath}/temp.ogg`;
  const fileName = `converted_${Date.now()}.mp3`;
  const outputPath = `${RNFS.CachesDirectoryPath}/${fileName}`;

  try {
    // Download the OGG file and wait for completion
    const downloadResult = await RNFS.downloadFile({
      fromUrl: oggUrl,
      toFile: tempOggPath,
    }).promise;

    // Verify download was successful
    if (downloadResult.statusCode !== 200) {
      throw new Error(`Download failed with status ${downloadResult.statusCode}`);
    }

    // Verify file exists before conversion
    const fileExists = await RNFS.exists(tempOggPath);
    if (!fileExists) {
      throw new Error('Downloaded file not found');
    }

    // Convert OGG to mp3 using ffmpeg
    await FFmpegKit.execute(
      `-i "${tempOggPath}" -vn -y -ar 44100 -ac 2 -c:a libmp3lame -b:a 192k "${outputPath}"`,
    );

    // Clean up the temporary OGG file
    if (await RNFS.exists(tempOggPath)) {
      await RNFS.unlink(tempOggPath);
    }

    // Verify output file exists
    const outputExists = await RNFS.exists(outputPath);
    if (!outputExists) {
      throw new Error('Conversion failed - output file not found');
    }

    return `file://${outputPath}`;
  } catch (error) {
    Sentry.captureException(error);
    // Clean up any temporary files in case of error
    try {
      if (await RNFS.exists(tempOggPath)) {
        await RNFS.unlink(tempOggPath);
      }
    } catch (cleanupError) {
      Sentry.captureException(cleanupError);
      // console.error('Error during cleanup:', cleanupError);
    }
    return oggUrl;
  }
};

export const convertAacToMp3 = async (inputPath: string): Promise<string> => {
  try {
    const fileName = `converted_${Date.now()}.mp3`;
    const outputPath = `${RNFS.CachesDirectoryPath}/${fileName}`;

    // Convert to MP3 using FFmpeg with optimal settings
    await FFmpegKit.execute(
      `-i "${inputPath}" -vn -y -ar 44100 -ac 2 -c:a libmp3lame -b:a 192k "${outputPath}"`,
    );

    // Verify output file exists
    const outputExists = await RNFS.exists(outputPath);
    if (!outputExists) {
      throw new Error('Conversion failed - output file not found');
    }

    return `file://${outputPath}`;
  } catch (error) {
    Sentry.captureException(error);
    throw error;
  }
};
