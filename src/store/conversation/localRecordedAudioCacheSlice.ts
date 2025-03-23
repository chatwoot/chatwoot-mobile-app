import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store';

interface LocalRecordedAudioCacheState {
  localRecordedAudioCacheFilePaths: string[];
}

export const initialState: LocalRecordedAudioCacheState = {
  localRecordedAudioCacheFilePaths: [],
};

const localRecordedAudioCacheSlice = createSlice({
  name: 'localRecordedAudioCache',
  initialState,
  reducers: {
    addNewCachePath: (state, action: PayloadAction<string>) => {
      state.localRecordedAudioCacheFilePaths.push(action.payload);
    },
  },
});

export const selectLocalRecordedAudioCacheFilePaths = (state: RootState) =>
  state.localRecordedAudioCache.localRecordedAudioCacheFilePaths;

export const { addNewCachePath } = localRecordedAudioCacheSlice.actions;
export default localRecordedAudioCacheSlice.reducer;
