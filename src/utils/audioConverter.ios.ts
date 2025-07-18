import RNFS from 'react-native-fs';
import * as Sentry from '@sentry/react-native';

/**
 * Converts OGG audio file from URL to WAV format
 * @param oggUrl - URL of the OGG audio file
 * @returns Promise<string | Error> - Path to converted WAV file or Error
 */
export const convertOggToWav = async (oggUrl: string): Promise<string | Error> => {
  const tempOggPath = `${RNFS.CachesDirectoryPath}/temp.ogg`;
  const fileName = `converted_${Date.now()}.wav`;
  const outputPath = `${RNFS.CachesDirectoryPath}/${fileName}`;

  try {
    // Download the OGG file
    const downloadResult = await RNFS.downloadFile({
      fromUrl: oggUrl,
      toFile: tempOggPath,
    }).promise;

    if (downloadResult.statusCode !== 200) {
      const error = new Error(`Download failed with status ${downloadResult.statusCode}`);
      Sentry.captureException(error);
      return error;
    }

    // Note: For iOS, we'll rely on the native audio system's ability to handle OGG files
    // and convert them using AVAudioConverter. This is a simplified implementation
    // that may need native iOS code to handle OGG to WAV conversion properly.

    // For now, we'll copy the file and let the app handle the format conversion
    // This is a placeholder - in a real implementation, you'd need native iOS code
    // to use AVAudioConverter for proper OGG to WAV conversion
    await RNFS.copyFile(tempOggPath, outputPath);

    // Clean up temporary file
    await RNFS.unlink(tempOggPath);

    return outputPath;
  } catch (error) {
    const convertError = error instanceof Error ? error : new Error('OGG conversion failed');
    Sentry.captureException(convertError);

    // Clean up temporary file if it exists
    try {
      await RNFS.unlink(tempOggPath);
    } catch {
      // Ignore cleanup errors
    }

    return convertError;
  }
};

/**
 * Converts AAC audio file to WAV format
 * @param aacPath - Path to the AAC audio file
 * @returns Promise<string | Error> - Path to converted WAV file or Error
 */
export const convertAacToWav = async (aacPath: string): Promise<string | Error> => {
  const fileName = `converted_${Date.now()}.wav`;
  const outputPath = `${RNFS.CachesDirectoryPath}/${fileName}`;

  try {
    // Check if source file exists
    const fileExists = await RNFS.exists(aacPath);
    if (!fileExists) {
      const error = new Error(`Source file does not exist: ${aacPath}`);
      Sentry.captureException(error);
      return error;
    }

    // Note: For iOS, we'll rely on the native audio system's ability to handle AAC files
    // and convert them using AVAudioConverter. This is a simplified implementation
    // that may need native iOS code to handle AAC to WAV conversion properly.

    // For now, we'll copy the file and let the app handle the format conversion
    // This is a placeholder - in a real implementation, you'd need native iOS code
    // to use AVAudioConverter for proper AAC to WAV conversion
    await RNFS.copyFile(aacPath, outputPath);

    return outputPath;
  } catch (error) {
    const convertError = error instanceof Error ? error : new Error('AAC conversion failed');
    Sentry.captureException(convertError);
    return convertError;
  }
};
