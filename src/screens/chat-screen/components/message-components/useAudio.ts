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

        // Ensure we have a duration value
        if (status.durationMillis && status.durationMillis > 0) {
          totalDuration.value = status.durationMillis;
        } else {
          // Try to get duration from AudioManager
          const cachedDuration = audioManager.getAudioDuration(audioUri);
          if (cachedDuration > 0) {
            totalDuration.value = cachedDuration;
          }
        }

        // Update loading state
        if (isLoading && status.isLoaded) {
          setIsLoading(false);
        }
      },
    );

    // Check if this audio is already playing
    const checkInitialState = async () => {
      try {
        setIsPlaying(audioManager.isAudioPlaying(audioUri));
        setIsLoading(audioManager.isAudioLoading(audioUri));

        // Try to get existing duration
        const cachedDuration = audioManager.getAudioDuration(audioUri);
        if (cachedDuration > 0) {
          totalDuration.value = cachedDuration;
        }
      } catch (error) {
        console.error('Error checking initial audio state:', error);
      }
    };
    checkInitialState();

    // Clean up when unmounting
    return () => {
      unregisterCallback();
    };
  }, [audioUri, currentPosition, totalDuration, isLoading, audioManager]);

  // Unload the audio when component unmounts
  useEffect(() => {
    return () => {
      // Only pause if this hook instance was the one that loaded it
      if (isPlaying) {
        audioManager.pauseAudio(audioUri).catch(console.error);
      }
    };
  }, [audioUri, audioManager, isPlaying]);

  const togglePlayback = useCallback(async () => {
    if (isPlaying) {
      // Pause the audio
      setIsLoading(true);
      try {
        await audioManager.pauseAudio(audioUri);
      } catch (error) {
        console.error('Error pausing audio:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Play the audio
      setIsLoading(true);
      try {
        const status = await audioManager.playAudio(audioUri);

        // Update total duration from initial playback
        if (status && status.isLoaded && status.durationMillis) {
          totalDuration.value = status.durationMillis;
        }
      } catch (error) {
        console.error('Error playing audio:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [audioUri, isPlaying, audioManager, totalDuration]);

  const seekTo = useCallback(
    async (position: number) => {
      try {
        setIsLoading(true);
        await audioManager.seekAudio(audioUri, position);

        // After seeking, resume playback if it was playing
        if (isPlaying) {
          const status = await audioManager.playAudio(audioUri);

          // Ensure we have duration after seeking
          if (status && status.isLoaded && status.durationMillis) {
            totalDuration.value = status.durationMillis;
          }
        }
      } catch (error) {
        console.error('Error seeking audio:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [audioUri, isPlaying, audioManager, totalDuration],
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
