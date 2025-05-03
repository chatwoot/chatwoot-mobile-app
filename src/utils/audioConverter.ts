import RNFS from 'react-native-fs';
// import { FFmpegKit } from 'ffmpeg-kit-react-native'; // Removed deprecated dependency
import * as Sentry from '@sentry/react-native';

export const convertOggToMp3 = async (oggUrl: string): Promise<string> => {
  const tempOggPath = `${RNFS.CachesDirectoryPath}/temp.ogg`;
  // const fileName = `converted_${Date.now()}.mp3`;
  // const outputPath = `${RNFS.CachesDirectoryPath}/${fileName}`;

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

    // TODO: Replace FFmpegKit with a new audio conversion method (server-side or alternative library).
    // Conversion logic removed:
    /*
    await FFmpegKit.execute(
      `-i "${tempOggPath}" -vn -y -ar 44100 -ac 2 -c:a libmp3lame -b:a 192k "${outputPath}"`,
    );
    */
    console.warn('Audio conversion (OGG to MP3) is disabled due to removed FFmpeg dependency.');
    // For now, return the original path or throw error depending on desired behavior
    // Option 1: Return original (might break playback expecting MP3)
    // return oggUrl;
    // Option 2: Throw specific error
    throw new Error('Audio conversion (OGG to MP3) functionality is currently disabled.');

    /*
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
    */
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
    // Re-throw or return original URL depending on chosen strategy
    if (error instanceof Error && error.message.includes('disabled')) {
      throw error; // Re-throw the specific disable error
    }
    return oggUrl; // Return original URL on other errors
  }
};

export const convertAacToMp3 = async (inputPath: string): Promise<string> => {
  try {
    // const fileName = `converted_${Date.now()}.mp3`;
    // const outputPath = `${RNFS.CachesDirectoryPath}/${fileName}`;

    // TODO: Replace FFmpegKit with a new audio conversion method (server-side or alternative library).
    // Conversion logic removed:
    /*
    await FFmpegKit.execute(
      `-i "${inputPath}" -vn -y -ar 44100 -ac 2 -c:a libmp3lame -b:a 192k "${outputPath}"`,
    );
    */
    console.warn('Audio conversion (AAC to MP3) is disabled due to removed FFmpeg dependency.');
    // For now, return the original path or throw error depending on desired behavior
    // Option 1: Return original (might break playback expecting MP3)
    // return inputPath;
    // Option 2: Throw specific error
    throw new Error('Audio conversion (AAC to MP3) functionality is currently disabled.');

    /*
    // Verify output file exists
    const outputExists = await RNFS.exists(outputPath);
    if (!outputExists) {
      throw new Error('Conversion failed - output file not found');
    }

    return `file://${outputPath}`;
    */
  } catch (error) {
    Sentry.captureException(error);
    throw error;
  }
};
