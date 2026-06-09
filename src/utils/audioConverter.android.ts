import RNFS from 'react-native-fs';
import { FFmpegKit } from 'ffmpeg-kit-react-native';
import * as Sentry from '@sentry/react-native';

// OGG voice notes recorded by the web widget (Chrome's MediaRecorder) don't
// carry duration metadata in the container. Android's stock MediaPlayer —
// which react-native-audio-recorder-player wraps — refuses to expose a valid
// `duration`/`currentPosition` for those files, so the UI slider can't
// advance and seek breaks. Transcode to a WAV with proper headers (same
// approach as iOS, where AVFoundation can't decode Opus at all). The
// ffmpeg-kit-react-native@6.0.2 `https` variant ships OGG + Opus + Vorbis
// decoders for Android by default.
export const convertOggToWav = async (oggUrl: string): Promise<string | Error> => {
  const tempOggPath = `${RNFS.CachesDirectoryPath}/temp_${Date.now()}.ogg`;
  const fileName = `converted_${Date.now()}.wav`;
  const outputPath = `${RNFS.CachesDirectoryPath}/${fileName}`;

  try {
    const downloadResult = await RNFS.downloadFile({ fromUrl: oggUrl, toFile: tempOggPath })
      .promise;

    if (downloadResult.statusCode !== 200) {
      Sentry.captureException(
        new Error(`Download failed with status ${downloadResult.statusCode}`),
      );
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
      // already gone
    }

    const outputExists = await RNFS.exists(outputPath);
    if (!outputExists) {
      throw new Error('Conversion failed - output file not found');
    }

    return `file://${outputPath}`;
  } catch (error) {
    Sentry.captureException(error);
    return error as Error;
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

    return outputPath;
  } catch (error) {
    Sentry.captureException(error);
    throw error;
  }
};
