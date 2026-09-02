import { AudioAttachmentSource } from '@/utils/audioSource';

// Android's media stack plays Ogg/Opus and WebM natively, so every source is
// played from its own url.
export const preparePlayableAudio = async (source: AudioAttachmentSource): Promise<string> => {
  return source.dataUrl;
};
