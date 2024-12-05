/**
 * This TypeScript code defines a Zustand store for managing a cache of local recorded audio file
 * paths.
 * @property {string[]} localRecordedAudioCacheFilePaths - An array of file paths representing the
 * cached recorded audio files.
 * @property addNewCachePath - The `addNewCachePath` function is used to add a new file path to the
 * `localRecordedAudioCacheFilePaths` array. It takes a `filePath` parameter, which is the path of the
 * recorded audio file, and adds it to the array using the `set` function from Zust
 */

import { create } from 'zustand';

export type LocalRecordedAudioCache = {
  localRecordedAudioCacheFilePaths: string[];
  addNewCachePath: (filePath: string) => void;
};

export const useLocalRecordedAudioCache = create<LocalRecordedAudioCache>(set => ({
  localRecordedAudioCacheFilePaths: [],
  addNewCachePath: (filePath: string) => {
    set(state => ({
      localRecordedAudioCacheFilePaths: [...state.localRecordedAudioCacheFilePaths, filePath],
    }));
  },
}));
