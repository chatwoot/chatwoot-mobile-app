// Platform-specific implementations live in audioConverter.ios.ts and
// audioConverter.android.ts; Metro picks one at build time.
import type { AudioAttachmentSource } from '@/utils/audioSource';

export declare const preparePlayableAudio: (source: AudioAttachmentSource) => Promise<string>;
export declare const convertAacToWav: (inputPath: string) => Promise<string>;
