import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, runOnJS, useSharedValue } from 'react-native-reanimated';
import Svg, { Path, Rect } from 'react-native-svg';
import * as Sentry from '@sentry/react-native';
import { Audio, AVPlaybackStatus } from 'expo-av';

import { useDispatch } from 'react-redux';
import { useAppSelector } from '@/hooks';
import { MESSAGE_VARIANTS } from '@/constants';
import { Slider } from '@/components-next/common';
import { Spinner } from '@/components-next/spinner';
import { tailwind } from '@/theme';
import { IconProps } from '@/types';
import {
  selectCurrentPlayingAudioSrc,
  setCurrentPlayingAudioSrc,
} from '@/store/conversation/audioPlayerSlice';
import { convertOggToWav } from '@/utils/audioConverter';

const formatTime = (ms: number) => {
  const total = Math.max(0, Math.floor((ms || 0) / 1000));
  const mm = String(Math.floor(total / 60)).padStart(2, '0');
  const ss = String(total % 60).padStart(2, '0');
  return `${mm}:${ss}`;
};

const PlayIcon = React.memo(({ fill, fillOpacity }: IconProps) => (
  <Svg width="10" height="13" viewBox="0 0 10 13" fill="none">
    <Path d="M0 13V0L10 6.80952L0 13Z" fill={fill} fillOpacity={fillOpacity} />
  </Svg>
));

const PauseIcon = React.memo(({ fill, fillOpacity }: IconProps) => (
  <Svg width="10" height="12" viewBox="0 0 10 12" fill="none">
    <Rect width="3" height="12" fill={fill} fillOpacity={fillOpacity} />
    <Rect x="7" width="3" height="12" fill={fill} fillOpacity={fillOpacity} />
  </Svg>
));

type AudioBubbleProps = {
  id: string;
  audioSrc: string;
  variant: string;
};

type QueueEntry = {
  id: string;
  getSrc: () => string;
  getKey: () => string;
  onLoading: (v: boolean) => void;
  onEnded: () => void;
  onStatus: (s: AVPlaybackStatus) => void;
};

/**
 * PlayerHub is a singleton audio manager responsible for handling all audio playback
 * across multiple `AudioBubblePlayer` instances. It ensures only one audio track
 * plays at a time and manages the lifecycle of `expo-av` Audio.Sound objects.
 * This pattern helps centralize audio control, prevent concurrent playback issues,
 * and manage resources efficiently.
 */
const PlayerHub = (() => {
  let sound: Audio.Sound | null = null; // The currently active Audio.Sound instance.
  let currentId: string | null = null; // The `idRef.current` of the currently playing AudioBubblePlayer.
  let currentKey: string | null = null; // Unique key for the current audio source (id::src).
  let currentSrc: string | null = null; // The audio source URI of the currently playing track.

  // Maps AudioBubblePlayer IDs to their registration entries.
  const entries = new Map<string, QueueEntry>();
  // Maintains the order of AudioBubblePlayer registration, used for playNextAfter.
  const order: string[] = [];
  // Stores IDs of players that should not automatically play the next track.
  const suppressAutoNext = new Set<string>();

  // A promise chain to sequentialize asynchronous audio operations, preventing race conditions.
  let opChain: Promise<void> = Promise.resolve();

  /**
   * Enqueues an asynchronous operation to be executed sequentially.
   * This prevents race conditions when multiple audio operations are triggered concurrently.
   * @param fn The asynchronous function to enqueue.
   * @returns A promise that resolves when the enqueued function completes.
   */
  const enqueue = (fn: () => Promise<void>) => {
    opChain = opChain.then(fn).catch(() => {});
    return opChain;
  };

  /**
   * Sets the audio mode for `expo-av`. This is crucial for controlling how audio interacts
   * with the device's audio system (e.g., mixing with other apps, silent mode behavior).
   * It's called before any playback to ensure consistent audio behavior.
   */
  const safeSetAudioMode = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        interruptionModeIOS: Audio.InterruptionModeIOS.DoNotMix, // Do not mix with other audio sources on iOS.
        playsInSilentModeIOS: true, // Allow playback when the device is in silent mode on iOS.
        staysActiveInBackground: false, // Audio should not stay active if app goes to background.
        interruptionModeAndroid: Audio.InterruptionModeAndroid.DoNotMix, // Do not mix with other audio sources on Android.
        shouldDuckAndroid: true, // Reduce volume of other audio when this audio plays on Android.
        playThroughEarpieceAndroid: false, // Play through speaker, not earpiece, on Android.
      });
    } catch (e) {
      Sentry.captureException(e);
    }
  };

  /**
   * Detaches the playback status update listener and unloads the `Audio.Sound` instance.
   * This frees up system resources and is part of the cleanup process.
   */
  const detachAndUnload = async () => {
    if (!sound) return;
    try {
      sound.setOnPlaybackStatusUpdate(null as any); // Remove status update listener.
    } catch {}
    try {
      await sound.unloadAsync(); // Unload the sound from memory.
    } catch {}
    sound = null; // Clear the sound instance.
  };

  /**
   * Stops the current playback and resets the position to 0, but does not unload the sound.
   */
  const stopAndReset = async () => {
    if (!sound) return;
    try {
      await sound.stopAsync(); // Stop playback.
    } catch {}
    try {
      await sound.setPositionAsync(0); // Reset position to beginning.
    } catch {}
  };

  /**
   * Stops and unloads the current audio if its ID matches the provided ID.
   * This is used when a specific `AudioBubblePlayer` is unmounting or its source changes.
   * @param id The ID of the AudioBubblePlayer requesting the stop.
   */
  const stopAndUnloadIfCurrent = async (id: string) => {
    if (currentId !== id) return; // Only act if this ID is the current one.
    currentId = null;
    currentKey = null;
    currentSrc = null;
    await stopAndReset();
    await detachAndUnload();
  };

  /**
   * Forces all audio playback to stop and unloads the current `Audio.Sound` instance.
   * This is primarily used for cleanup during Fast Refresh/HMR or when the player hub needs
   * a complete reset.
   */
  const forceStopAll = async () => {
    currentId = null;
    currentKey = null;
    currentSrc = null;
    try {
      await stopAndReset();
    } catch {}
    try {
      await detachAndUnload();
    } catch {}
  };

  /**
   * Registers an `AudioBubblePlayer` component with the PlayerHub.
   * This allows the PlayerHub to manage its playback status and respond to global audio events.
   * @param entry The QueueEntry object containing the player's details and callbacks.
   */
  const register = (entry: QueueEntry) => {
    if (!entries.has(entry.id)) order.push(entry.id); // Add to order if new.
    entries.set(entry.id, entry);
  };

  /**
   * Unregisters an `AudioBubblePlayer` component from the PlayerHub.
   * Called when an `AudioBubblePlayer` unmounts.
   * @param id The ID of the player to unregister.
   */
  const unregister = (id: string) => {
    entries.delete(id);
    const idx = order.indexOf(id);
    if (idx >= 0) order.splice(idx, 1); // Remove from order.
    suppressAutoNext.delete(id); // Ensure no lingering auto-next suppression.
  };

  /**
   * Prevents the given `AudioBubblePlayer` from automatically playing the next track
   * in the sequence, specifically when its current track finishes.
   * @param id The ID of the player to suppress.
   */
  const suppressNextOnce = (id: string) => suppressAutoNext.add(id);

  /**
   * Checks if the given `AudioBubblePlayer` ID matches the ID of the currently playing audio.
   * @param id The ID to check.
   * @returns True if the ID is current, false otherwise.
   */
  const isCurrent = (id: string) => currentId === id;
  /**
   * Returns the unique key of the currently playing audio source.
   * @returns The current audio key, or an empty string if nothing is playing.
   */
  const getCurrentKey = () => currentKey ?? '';

  /**
   * Attaches a playback status update listener to the `Audio.Sound` instance.
   * This listener updates the corresponding `AudioBubblePlayer` with the latest playback status,
   * handles track completion, and triggers auto-play of the next track if applicable.
   * @param s The Audio.Sound instance to attach the listener to.
   */
  const attachStatusUpdates = (s: Audio.Sound) => {
    s.setOnPlaybackStatusUpdate((st) => {
      const activeId = currentId;
      if (!activeId) return; // No active player.

      const entry = entries.get(activeId);
      if (entry) entry.onStatus(st); // Update the specific player's status.

      if (!st.isLoaded) return; // Only proceed if the sound is loaded.

      if ((st as any).didJustFinish) {
        const endedId = activeId;
        const endedEntry = entries.get(endedId);

        endedEntry?.onLoading(false); // Stop loading indicator.

        // If auto-next was suppressed for this track, clear the flag and return.
        if (suppressAutoNext.has(endedId)) {
          suppressAutoNext.delete(endedId);
          return;
        }

        endedEntry?.onEnded(); // Notify the player that the track has ended.
      }
    });
  };

  /**
   * Initiates playback for a specific `AudioBubblePlayer` by its ID.
   * Manages stopping any currently playing audio and loading the new audio source.
   * @param id The ID of the `AudioBubblePlayer` to play.
   */
  const playById = async (id: string) => {
    const entry = entries.get(id);
    if (!entry) return; // Player not registered.

    const src = entry.getSrc();
    const key = entry.getKey();
    if (!src || !key) return; // Invalid audio source.

    await safeSetAudioMode(); // Ensure correct audio mode is set.

    // If the requested audio is already the current one and has a sound instance,
    // check its status and resume if paused, or simply return if already playing.
    if (currentId === id && sound) {
      try {
        const st = await sound.getStatusAsync();
        if (st.isLoaded) {
          currentSrc = src;
          currentKey = key;
          if ((st as any).isPlaying) {
            entry.onLoading(false); // Already playing, so not loading.
            return;
          }
          await sound.playAsync(); // Resume if paused.
          entry.onLoading(false);
          return;
        }
      } catch (e) {
        Sentry.captureException(e);
      }
    }

    // If another audio is currently playing, stop and unload it before playing the new one.
    if (currentId && currentId !== id) {
      suppressNextOnce(currentId); // Prevent the old track from auto-playing the next.
      const prev = entries.get(currentId);
      prev?.onLoading(false); // Turn off loading for the previous track.
      await stopAndReset();
      await detachAndUnload();
    }

    // Set the new audio as current.
    currentId = id;
    currentSrc = src;
    currentKey = key;

    entry.onLoading(true); // Show loading indicator for the new track.

    try {
      const s = new Audio.Sound();
      sound = s; // Assign the new sound instance.
      attachStatusUpdates(s); // Attach status listener.

      // Load and play the new audio.
      await s.loadAsync({ uri: src }, { shouldPlay: true, positionMillis: 0 }, true);
      await s.setProgressUpdateIntervalAsync(250); // Set update interval for slider.

      entry.onLoading(false); // Hide loading indicator.
    } catch (e) {
      // Handle errors during loading/playback.
      entry.onLoading(false);
      await detachAndUnload();
      if (currentId === id) {
        currentId = null;
        currentKey = null;
        currentSrc = null;
      }
      Sentry.captureException(e);
    }
  };

  /**
   * Pauses the currently playing audio.
   */
  const pause = async () => {
    if (!sound) return;
    try {
      await sound.pauseAsync();
    } catch (e) {
      Sentry.captureException(e);
    }
  };

  /**
   * Resumes the currently paused audio.
   */
  const resume = async () => {
    if (!sound) return;
    try {
      await sound.playAsync();
    } catch (e) {
      Sentry.captureException(e);
    }
  };

  /**
   * Seeks to a specific position in the currently playing audio.
   * @param ms The position in milliseconds to seek to.
   */
  const seekTo = async (ms: number) => {
    if (!sound) return;
    try {
      await sound.setPositionAsync(Math.max(0, Math.floor(ms)));
    } catch (e) {
      Sentry.captureException(e);
    }
  };

  /**
   * Plays the next audio in the `order` queue if the current audio finishes.
   * If there is no next audio, it stops and unloads the current one.
   * @param id The ID of the audio that just finished.
   */
  const playNextAfter = async (id: string) => {
    if (currentId !== id) return; // Only proceed if this is the currently active audio.

    const idx = order.indexOf(id);
    const nextId = idx >= 0 ? order[idx + 1] ?? null : null; // Get the next ID in the ordered list.

    if (!nextId) {
      // No more tracks in the queue, so stop and unload.
      await stopAndUnloadIfCurrent(id);
      return;
    }

    await playById(nextId); // Play the next track.
  };

  return {
    register,
    unregister,
    enqueue,
    playById,
    pause,
    resume,
    seekTo,
    playNextAfter,
    suppressNextOnce,
    stopAndUnloadIfCurrent,
    forceStopAll,
    isCurrent,
    getCurrentKey,
  };
})();

// Assign the PlayerHub to a global variable to ensure it's a true singleton
// across different instances of the module, especially during hot module reloading.
const g: any = globalThis as any;
try {
  // If a previous instance of PlayerHub exists, ensure it's cleaned up.
  const prev = g.__AUDIO_BUBBLE_PLAYER_HUB__;
  if (prev && typeof prev.forceStopAll === 'function') {
    prev.enqueue(() => prev.forceStopAll());
  }
} catch {}
g.__AUDIO_BUBBLE_PLAYER_HUB__ = PlayerHub;

/**
 * Best-effort cleanup on Fast Refresh / HMR (Hot Module Replacement).
 * When the module is reloaded, this ensures that the previous PlayerHub instance
 * is properly stopped to prevent multiple audio contexts or lingering playback.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _m: any = typeof module !== 'undefined' ? (module as any) : null;
if (_m?.hot) {
  _m.hot.dispose(() => {
    try {
      PlayerHub.enqueue(() => PlayerHub.forceStopAll());
    } catch {}
  });
}

/**
 * Probes an audio URI to determine its duration in milliseconds without playing it.
 * This is used to get the total duration for the slider before playback begins.
 * @param uri The URI of the audio file.
 * @returns A promise that resolves with the duration in milliseconds, or 0 if an error occurs.
 */
const probeDurationMs = async (uri: string): Promise<number> => {
  try {
    const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: false }, undefined, false);
    const st = await sound.getStatusAsync();
    await sound.unloadAsync(); // Unload immediately after getting status.
    if (st.isLoaded && typeof (st as any).durationMillis === 'number') return (st as any).durationMillis ?? 0;
    return 0;
  } catch {
    return 0;
  }
};

export const AudioBubblePlayer = React.memo((props: AudioBubbleProps) => {
  const { audioSrc, variant, id } = props;

  const dispatch = useDispatch();
  // Selects the key of the audio source that is currently globally playing.
  const currentPlayingKey = useAppSelector(selectCurrentPlayingAudioSrc);

  // Local state for UI feedback.
  const [isSoundLoading, setIsSoundLoading] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  // State to hold the audio source, potentially converted (e.g., OGG to WAV).
  const [convertedAudioSrc, setConvertedAudioSrc] = useState(audioSrc);

  // Local state for displaying current and total time.
  const [currentTime, setCurrentTime] = useState('00:00');
  const [totalTime, setTotalTime] = useState('00:00');

  // Shared values for Reanimated slider to track playback progress.
  const currentPosition = useSharedValue(0);
  const totalDuration = useSharedValue(0);

  // Unique ref for this AudioBubblePlayer instance for PlayerHub registration.
  const idRef = useRef(`ab_${id}`);
  // Ref to track if the duration has been loaded to avoid repeated calculations.
  const durationLoadedRef = useRef(false);
  // Ref to store the last known AVPlaybackStatus, useful for resuming playback state.
  const lastStatusRef = useRef<AVPlaybackStatus | null>(null);
  // Guard to prevent `onEnded` from being called multiple times.
  const endedGuardRef = useRef(false);

  // Memoized unique key for this audio source, used for global state management.
  const key = useMemo(() => `${id}::${convertedAudioSrc}`, [id, convertedAudioSrc]);

  useEffect(() => {
    /**
     * Prepares the audio source. This includes converting OGG to WAV for iOS
     * compatibility if necessary, and setting the `convertedAudioSrc`.
     */
    const prepare = async () => {
      setConvertedAudioSrc(audioSrc); // Start with the original audio source.

      const isOggLike = /\.(ogg|oga|opus)$/i.test(audioSrc);
      if (Platform.OS === 'ios' && isOggLike) {
        setIsSoundLoading(true);
        try {
          // Convert OGG to WAV for iOS compatibility.
          const converted = await convertOggToWav(audioSrc);
          const normalized = typeof (converted as any)?.uri === 'string' ? (converted as any).uri : converted;
          setConvertedAudioSrc(typeof normalized === 'string' ? normalized : audioSrc);
        } catch (e) {
          Sentry.captureException(e);
          setConvertedAudioSrc(audioSrc); // Fallback to original if conversion fails.
        } finally {
          setIsSoundLoading(false);
        }
      }
    };

    prepare();
  }, [audioSrc]); // Re-run when the audio source changes.

  useEffect(() => {
    // Reset playback state when the audio source or its key changes.
    durationLoadedRef.current = false;
    currentPosition.value = 0;
    totalDuration.value = 0;
    setIsAudioPlaying(false);
    setCurrentTime('00:00');
    setTotalTime('00:00');

    let cancelled = false;
    // Probe the duration of the audio file to display total time on the slider.
    probeDurationMs(convertedAudioSrc).then((d) => {
      if (cancelled) return;
      if (d > 0) {
        durationLoadedRef.current = true;
        totalDuration.value = d;
        setTotalTime(formatTime(d));
      }
    });

    // If this audio is currently designated as the globally playing audio,
    // ensure the Redux state reflects its key.
    const hubKey = PlayerHub.getCurrentKey();
    if (hubKey && hubKey === key) {
      dispatch(setCurrentPlayingAudioSrc(key));
    }

    return () => {
      cancelled = true; // Cleanup for `probeDurationMs` to prevent state updates on unmount.
    };
  }, [convertedAudioSrc, currentPosition, totalDuration]); // Dependencies for re-running this effect.

  /**
   * Callback for PlayerHub to update the UI with the latest playback status.
   * @param st The AVPlaybackStatus object from expo-av.
   */
  const onStatus = useCallback(
    (st: AVPlaybackStatus) => {
      lastStatusRef.current = st; // Keep track of the last status.

      if (!st.isLoaded) {
        setIsAudioPlaying(false);
        return;
      }

      // Extract playback position, duration, and playing status.
      const pos = (st as any).positionMillis ?? 0;
      const dur = (st as any).durationMillis ?? 0;
      const playing = (st as any).isPlaying ?? false;

      currentPosition.value = pos; // Update Reanimated shared value for slider.
      setCurrentTime(formatTime(pos)); // Update formatted current time for display.
      setIsAudioPlaying(!!playing); // Update local playing state.

      if (dur > 0) {
        // If duration is valid, update total duration if it hasn't been loaded or has changed.
        if (!durationLoadedRef.current || totalDuration.value !== dur) {
          durationLoadedRef.current = true;
          totalDuration.value = dur;
          setTotalTime(formatTime(dur));
        }
      }
    },
    [currentPosition, totalDuration], // Dependencies for this callback.
  );

  useEffect(() => {
    // Register this AudioBubblePlayer instance with the global PlayerHub.
    PlayerHub.register({
      id: idRef.current, // Unique ID for this player.
      getSrc: () => convertedAudioSrc, // Function to get the current audio source.
      getKey: () => key, // Function to get the unique key.
      onLoading: setIsSoundLoading, // Callback to update loading state.
      onStatus, // Callback for playback status updates.
      onEnded: async () => {
        // Callback when this audio track ends.
        if (endedGuardRef.current) return;
        endedGuardRef.current = true;

        setIsAudioPlaying(false);
        dispatch(setCurrentPlayingAudioSrc('')); // Clear global playing state.
        currentPosition.value = 0;
        setCurrentTime('00:00');

        // Enqueue playing the next track in the sequence.
        await PlayerHub.enqueue(() => PlayerHub.playNextAfter(idRef.current));

        // If a new track started playing, update the global playing state.
        const nextKey = PlayerHub.getCurrentKey();
        if (nextKey) dispatch(setCurrentPlayingAudioSrc(nextKey));

        endedGuardRef.current = false;
      },
    });

    return () => {
      // Unregister from PlayerHub when the component unmounts.
      // Note: PlayerHub.stopAndUnloadIfCurrent is not called here directly,
      // as it's managed by PlayerHub's internal logic and HMR cleanup.
      PlayerHub.unregister(idRef.current);
    };
  }, [convertedAudioSrc, dispatch, currentPosition, key, onStatus]);

  // Memoized boolean to check if this specific AudioBubblePlayer is the one currently playing globally.
  const isThisCurrent = useMemo(
    () => currentPlayingKey === key && PlayerHub.isCurrent(idRef.current),
    [currentPlayingKey, key],
  );

  useEffect(() => {
    // If this player is no longer the globally active one, reset its local playback state.
    if (!isThisCurrent) {
      setIsAudioPlaying(false);
      currentPosition.value = 0;
      setCurrentTime('00:00');
    }
  }, [isThisCurrent, currentPosition]);

  /**
   * Handles play/pause toggle for the audio bubble.
   * Enqueues the operation to maintain sequential execution in PlayerHub.
   */
  const togglePlayback = useCallback(async () => {
    if (!convertedAudioSrc) return; // Cannot play if there's no source.

    await PlayerHub.enqueue(async () => {
      try {
        if (isThisCurrent) {
          // If this player is currently active, toggle its play/pause state.
          const st = lastStatusRef.current;
          const playing = st && (st as any).isLoaded ? (st as any).isPlaying : isAudioPlaying;

          if (playing) {
            PlayerHub.suppressNextOnce(idRef.current); // Prevent auto-play next if paused by user.
            await PlayerHub.pause();
          } else {
            await PlayerHub.resume();
          }
          return;
        }

        // If this player is not active, start playing its audio.
        setIsSoundLoading(true);
        await PlayerHub.playById(idRef.current);
        setIsSoundLoading(false);
        dispatch(setCurrentPlayingAudioSrc(key)); // Update global state.
      } catch (e) {
        setIsSoundLoading(false);
        Sentry.captureException(e);
      }
    });
  }, [convertedAudioSrc, dispatch, isThisCurrent, isAudioPlaying, key]);

  /**
   * Internal callback for seeking to a specific position (JavaScript thread).
   * @param manualSeekPositionMs The position in milliseconds to seek to.
   */
  const manualSeekToJS = useCallback(
    async (manualSeekPositionMs: number) => {
      await PlayerHub.enqueue(async () => {
        const max = totalDuration.value > 0 ? totalDuration.value : manualSeekPositionMs;
        const next = Math.max(0, Math.min(manualSeekPositionMs, max));

        currentPosition.value = next;
        setCurrentTime(formatTime(next));

        await PlayerHub.seekTo(next);

        // If this player is current and was paused, resume playback after seeking.
        if (isThisCurrent) {
          const st = lastStatusRef.current;
          const playing = st && (st as any).isLoaded ? (st as any).isPlaying : isAudioPlaying;
          if (!playing) await PlayerHub.resume();
        }
      });
    },
    [currentPosition, totalDuration, isThisCurrent, isAudioPlaying],
  );

  /**
   * Internal callback for pausing audio (JavaScript thread).
   */
  const pauseAudioJS = useCallback(async () => {
    await PlayerHub.enqueue(async () => {
      PlayerHub.suppressNextOnce(idRef.current); // Prevent auto-play next.
      await PlayerHub.pause();
    });
  }, []);

  /**
   * Memoized version of `manualSeekToJS` for use in Reanimated worklets (UI thread).
   */
  const manualSeekTo = useMemo(() => {
    return (ms: number) => {
      'worklet'; // Marks this function to be executed on the UI thread.
      runOnJS(manualSeekToJS)(ms); // Call the JS thread function from the UI thread.
    };
  }, [manualSeekToJS]);

  /**
   * Memoized version of `pauseAudioJS` for use in Reanimated worklets (UI thread).
   */
  const pauseAudio = useMemo(() => {
    return () => {
      'worklet'; // Marks this function to be executed on the UI thread.
      runOnJS(pauseAudioJS)(); // Call the JS thread function from the UI thread.
    };
  }, [pauseAudioJS]);

  // Memoized boolean indicating if this specific audio is currently playing and active.
  const isCurrentAudioPlaying = useMemo(
    () => isThisCurrent && isAudioPlaying,
    [isThisCurrent, isAudioPlaying],
  );

  const sliderProps = useMemo(
    () => ({
      trackColor: variant === MESSAGE_VARIANTS.USER ? 'bg-whiteA-A9' : 'bg-gray-500',
      filledTrackColor: variant === MESSAGE_VARIANTS.USER ? 'bg-white' : 'bg-blue-700',
      knobStyle: variant === MESSAGE_VARIANTS.USER ? 'border-blue-300' : 'border-blue-700',
      manualSeekTo,
      currentPosition,
      totalDuration,
      pauseAudio,
    }),
    [variant, manualSeekTo, currentPosition, totalDuration, pauseAudio],
  );

  return (
    <View style={tailwind.style('w-full flex flex-row items-center flex-1')}>
      <Pressable disabled={isSoundLoading} hitSlop={10} onPress={togglePlayback}>
        {isSoundLoading ? (
          // Show spinner when audio is loading
          <Animated.View>
            <Spinner size={13} stroke={variant === MESSAGE_VARIANTS.USER ? 'white' : 'black'} />
          </Animated.View>
        ) : isCurrentAudioPlaying ? (
          // Show pause icon if currently playing
          <Animated.View style={tailwind.style('pl-0.5 pr-0.5')} entering={FadeIn} exiting={FadeOut}>
            <PauseIcon
              fillOpacity={variant === MESSAGE_VARIANTS.USER ? '1' : '0.565'}
              fill={variant === MESSAGE_VARIANTS.USER ? 'white' : 'black'}
            />
          </Animated.View>
        ) : (
          // Show play icon if not playing
          <Animated.View style={tailwind.style('pl-0.5 pr-0.5')} entering={FadeIn} exiting={FadeOut}>
            <PlayIcon
              fillOpacity={variant === MESSAGE_VARIANTS.USER ? '1' : '0.565'}
              fill={variant === MESSAGE_VARIANTS.USER ? 'white' : 'black'}
            />
          </Animated.View>
        )}
      </Pressable>

      <Slider {...sliderProps} />

      {/* Time display for current and total duration */}
      <View style={tailwind.style('w-10 flex-row justify-end')}>
        <Text
          style={tailwind.style(
            'text-xs font-inter-420-20',
            variant === MESSAGE_VARIANTS.USER ? 'text-whiteA-A11' : 'text-gray-700',
            !isCurrentAudioPlaying ? 'hidden' : '', // Hide current time if not playing
          )}>
          {currentTime}
        </Text>
        <Text
          style={tailwind.style(
            'text-xs font-inter-420-20',
            variant === MESSAGE_VARIANTS.USER ? 'text-whiteA-A11' : 'text-gray-700',
            isCurrentAudioPlaying ? 'hidden' : '', // Hide total time if playing (as current time is shown)
          )}>
          {totalTime}
        </Text>
      </View>
    </View>
  );
});

export const AudioBubble = React.memo<AudioBubbleProps>((props) => {
  const { audioSrc, variant, id } = props;

  // Renders the AudioBubblePlayer component, passing down relevant props.
  return (
    <Animated.View style={tailwind.style('w-full flex flex-row items-center')}>
      <AudioBubblePlayer id={id} audioSrc={audioSrc} variant={variant} />
    </Animated.View>
  );
});
