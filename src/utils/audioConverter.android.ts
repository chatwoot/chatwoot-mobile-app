/**
 * Android's MediaPlayer decodes the formats we receive, so no transcoding step
 * is needed. FFmpeg is not bundled on Android.
 */
export const convertToWav = async (sourceUrl: string): Promise<string> => {
  return sourceUrl;
};

export const convertAacToWav = async (inputPath: string): Promise<string> => {
  return inputPath;
};
