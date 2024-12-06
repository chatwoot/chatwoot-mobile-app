import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store';

interface AudioPlayerState {
  currentPlayingAudioSrc: string;
}

const initialState: AudioPlayerState = {
  currentPlayingAudioSrc: '',
};

const audioPlayerSlice = createSlice({
  name: 'audioPlayer',
  initialState,
  reducers: {
    setCurrentPlayingAudioSrc: (state, action: PayloadAction<string>) => {
      state.currentPlayingAudioSrc = action.payload;
    },
  },
});

// Selector
export const selectCurrentPlayingAudioSrc = (state: RootState) =>
  state.audioPlayer.currentPlayingAudioSrc;

// Actions
export const { setCurrentPlayingAudioSrc } = audioPlayerSlice.actions;

export default audioPlayerSlice.reducer;
