import { useCallback, useEffect, useState } from 'react';
import { AVPlaybackStatus } from 'expo-av';
import { useSharedValue, SharedValue } from 'react-native-reanimated';
import AudioManager from './AudioManager';

type UseAudioResult = {
  isLoading: boolean;
  isPlaying: boolean;
  currentPosition: SharedValue<number>;
  totalDuration: SharedValue<number>;
  togglePlayback: () => void;
  seekTo: (position: number) => Promise<void>;
  pause: () => Promise<void>;
};

/**
 * Custom hook for managing audio playback
 * @param audioUri The URI of the audio file to play
 * @returns An object with audio controls and state
 */
export const useAudio = (audioUri: string): UseAudioResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentPosition = useSharedValue(0);
  const totalDuration = useSharedValue(0);

  const audioManager = AudioManager.getInstance();

  // Set up status update listener
  useEffect(() => {
    const unregisterCallback = audioManager.registerStatusUpdateCallback(
      (uri, status: AVPlaybackStatus) => {
        if (uri !== audioUri || !status.isLoaded) return;

        // Update playback state
        setIsPlaying(status.isPlaying);

        // Update position and duration for slider
        currentPosition.value = status.positionMillis || 0;
        totalDuration.value = status.durationMillis || 0;

        // Update loading state
        if (isLoading && status.isLoaded) {
          setIsLoading(false);
        }
      },
    );

    // Clean up when unmounting
    return () => {
      unregisterCallback();
    };
  }, [audioUri, currentPosition, totalDuration, isLoading, audioManager]);

  // Unload the audio when hook unmounts
  useEffect(() => {
    return () => {
      audioManager.unloadAudio(audioUri);
    };
  }, [audioUri, audioManager]);

  const togglePlayback = useCallback(() => {
    if (isPlaying) {
      // Pause the audio
      setIsLoading(true);
      audioManager.pauseAudio(audioUri).finally(() => setIsLoading(false));
    } else {
      // Play the audio
      setIsLoading(true);
      audioManager
        .playAudio(audioUri)
        .catch(error => {
          console.error('Error playing audio:', error);
        })
        .finally(() => setIsLoading(false));
    }
  }, [audioUri, isPlaying, audioManager]);

  const seekTo = useCallback(
    async (position: number) => {
      try {
        await audioManager.seekAudio(audioUri, position);

        // After seeking, resume playback if it was playing
        if (isPlaying) {
          await audioManager.playAudio(audioUri);
        }
      } catch (error) {
        console.error('Error seeking audio:', error);
      }
    },
    [audioUri, isPlaying, audioManager],
  );

  const pause = useCallback(async () => {
    try {
      await audioManager.pauseAudio(audioUri);
    } catch (error) {
      console.error('Error pausing audio:', error);
    }
  }, [audioUri, audioManager]);

  return {
    isLoading,
    isPlaying,
    currentPosition,
    totalDuration,
    togglePlayback,
    seekTo,
    pause,
  };
};
