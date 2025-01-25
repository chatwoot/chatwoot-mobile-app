import RNFS from 'react-native-fs';
import { FFmpegKit } from 'ffmpeg-kit-react-native';

export const convertOggToAac = async (oggUrl: string): Promise<string> => {
  try {
    // Create unique filename for converted audio
    const fileName = `converted_${Date.now()}.m4a`;
    const outputPath = `${RNFS.CachesDirectoryPath}/${fileName}`;

    // Download the OGG file
    await RNFS.downloadFile({
      fromUrl: oggUrl,
      toFile: `${RNFS.CachesDirectoryPath}/temp.ogg`,
    }).promise;

    // Convert OGG to AAC using FFmpeg
    await FFmpegKit.execute(
      `-i ${RNFS.CachesDirectoryPath}/temp.ogg -c:a aac -b:a 128k ${outputPath}`,
    );

    // Clean up the temporary OGG file
    await RNFS.unlink(`${RNFS.CachesDirectoryPath}/temp.ogg`);

    console.log('outputPath', outputPath);

    return `file://${outputPath}`;
  } catch (error) {
    console.error('Error converting audio:', error);
    return oggUrl; // Return original URL if conversion fails
  }
};
