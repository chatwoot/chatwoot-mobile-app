import { create } from 'zustand';

export type AudioPlayer = {
  currentPlayingAudioSrc: string;
  setCurrentPlayingAudioSrc: (audioSrc: string) => void;
};

export const useAudioPlayer = create<AudioPlayer>(set => ({
  currentPlayingAudioSrc: '',
  setCurrentPlayingAudioSrc: (audioSrc: string) => {
    set(state => ({ ...state, currentPlayingAudioSrc: audioSrc }));
  },
}));
