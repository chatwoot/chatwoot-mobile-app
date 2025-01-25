import RNFS from 'react-native-fs';
import { FFmpegKit } from 'ffmpeg-kit-react-native';

export const convertOggToAac = async (oggUrl: string): Promise<string> => {
  const tempOggPath = `${RNFS.CachesDirectoryPath}/temp.ogg`;
  const fileName = `converted_${Date.now()}.m4a`;
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

    // Convert OGG to AAC using FFmpeg
    await FFmpegKit.execute(`-i "${tempOggPath}" -c:a aac -b:a 128k "${outputPath}"`);

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
    console.error('Error converting audio:', oggUrl, error);
    // Clean up any temporary files in case of error
    try {
      if (await RNFS.exists(tempOggPath)) {
        await RNFS.unlink(tempOggPath);
      }
    } catch (cleanupError) {
      console.error('Error during cleanup:', cleanupError);
    }
    return oggUrl;
  }
};
