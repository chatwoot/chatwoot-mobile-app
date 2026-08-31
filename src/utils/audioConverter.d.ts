// Platform-specific implementations live in audioConverter.ios.ts and
// audioConverter.android.ts; Metro picks one at build time.
export declare const convertOggToWav: (oggUrl: string) => Promise<string | Error>;
export declare const convertAacToWav: (inputPath: string) => Promise<string>;
