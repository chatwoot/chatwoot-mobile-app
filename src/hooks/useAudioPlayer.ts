import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { PlayBackType } from 'react-native-audio-recorder-player';
import { useSharedValue } from 'react-native-reanimated';
import { useDispatch } from 'react-redux';

import { setCurrentPlayingAudioSrc } from '@/store/conversation/audioPlayerSlice';
import { useAppSelector } from '@/hooks';
import { selectCurrentPlayingAudioSrc } from '@/store/conversation/audioPlayerSlice';
import { convertOggToAac } from '../utils/audioConverter';
import { pausePlayer, resumePlayer, seekTo, startPlayer, stopPlayer } from '../utils/audioManager';

export const useAudioPlayer = (audioSrc: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const dispatch = useDispatch();
  const currentPlayingAudioSrc = useAppSelector(selectCurrentPlayingAudioSrc);

  const currentPosition = useSharedValue(0);
  const totalDuration = useSharedValue(0);

  const handlePlaybackStatus = (data: any) => {
    const playBackData = data.data as PlayBackType;
    if (playBackData) {
      currentPosition.value = playBackData.currentPosition;
      totalDuration.value = playBackData.duration;
      if (playBackData.currentPosition === playBackData.duration) {
        currentPosition.value = 0;
        totalDuration.value = 0;
        setIsPlaying(false);
        dispatch(setCurrentPlayingAudioSrc(''));
      }
    }
  };

  const handleTogglePlayback = async () => {
    if (audioSrc === currentPlayingAudioSrc) {
      if (isPlaying) {
        await pausePlayer();
      } else {
        await resumePlayer();
      }
      setIsPlaying(!isPlaying);
      return;
    }

    setIsLoading(true);
    try {
      let sourceToPlay = audioSrc;
      if (Platform.OS === 'ios' && audioSrc.toLowerCase().endsWith('.ogg')) {
        sourceToPlay = await convertOggToAac(audioSrc);
      }
      await startPlayer(sourceToPlay, handlePlaybackStatus);
      setIsPlaying(true);
      dispatch(setCurrentPlayingAudioSrc(sourceToPlay));
    } catch (error) {
      console.error('Error playing audio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeek = async (position: number) => {
    await seekTo(position);
    await resumePlayer();
  };

  const handlePause = async () => {
    await pausePlayer();
  };

  useEffect(() => {
    if (currentPlayingAudioSrc !== audioSrc) {
      currentPosition.value = 0;
      totalDuration.value = 0;
    }
  }, [currentPlayingAudioSrc, audioSrc]);

  useEffect(() => {
    return () => {
      stopPlayer()
        .then()
        .finally(() => {
          setIsPlaying(false);
          dispatch(setCurrentPlayingAudioSrc(''));
        });
    };
  }, []);

  return {
    isLoading,
    isPlaying,
    currentPosition,
    totalDuration,
    handleTogglePlayback,
    handleSeek,
    handlePause,
  };
};
