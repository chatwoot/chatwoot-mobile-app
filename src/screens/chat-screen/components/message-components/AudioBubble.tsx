import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, useSharedValue } from 'react-native-reanimated';
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

const PlayerHub = (() => {
  let sound: Audio.Sound | null = null;
  let currentId: string | null = null;
  let currentKey: string | null = null;
  let currentSrc: string | null = null;

  const entries = new Map<string, QueueEntry>();
  const order: string[] = [];
  const suppressAutoNext = new Set<string>();

  let opChain: Promise<void> = Promise.resolve();

  const enqueue = (fn: () => Promise<void>) => {
    opChain = opChain.then(fn).catch(() => {});
    return opChain;
  };

  const safeSetAudioMode = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (e) {
      Sentry.captureException(e);
    }
  };

  const detachAndUnload = async () => {
    if (!sound) return;
    try {
      sound.setOnPlaybackStatusUpdate(null as any);
    } catch {}
    try {
      await sound.unloadAsync();
    } catch {}
    sound = null;
  };

  const stopAndReset = async () => {
    if (!sound) return;
    try {
      await sound.stopAsync();
    } catch {}
    try {
      await sound.setPositionAsync(0);
    } catch {}
  };

  const stopAndUnloadIfCurrent = async (id: string) => {
    if (currentId !== id) return;
    currentId = null;
    currentKey = null;
    currentSrc = null;
    await stopAndReset();
    await detachAndUnload();
  };

  const register = (entry: QueueEntry) => {
    if (!entries.has(entry.id)) order.push(entry.id);
    entries.set(entry.id, entry);
  };

  const unregister = (id: string) => {
    entries.delete(id);
    const idx = order.indexOf(id);
    if (idx >= 0) order.splice(idx, 1);
    suppressAutoNext.delete(id);
  };

  const suppressNextOnce = (id: string) => suppressAutoNext.add(id);

  const isCurrent = (id: string) => currentId === id;
  const getCurrentKey = () => currentKey ?? '';

  const attachStatusUpdates = (s: Audio.Sound) => {
    s.setOnPlaybackStatusUpdate((st) => {
      const activeId = currentId;
      if (!activeId) return;

      const entry = entries.get(activeId);
      if (entry) entry.onStatus(st);

      if (!st.isLoaded) return;

      if ((st as any).didJustFinish) {
        const endedId = activeId;
        const endedEntry = entries.get(endedId);

        endedEntry?.onLoading(false);

        if (suppressAutoNext.has(endedId)) {
          suppressAutoNext.delete(endedId);
          return;
        }

        endedEntry?.onEnded();
      }
    });
  };

  const playById = async (id: string) => {
    const entry = entries.get(id);
    if (!entry) return;

    const src = entry.getSrc();
    const key = entry.getKey();
    if (!src || !key) return;

    await safeSetAudioMode();

    if (currentId && currentId !== id) {
      suppressNextOnce(currentId);
      const prev = entries.get(currentId);
      prev?.onLoading(false);
      await stopAndReset();
      await detachAndUnload();
    }

    currentId = id;
    currentSrc = src;
    currentKey = key;

    entry.onLoading(true);

    try {
      const s = new Audio.Sound();
      sound = s;
      attachStatusUpdates(s);

      await s.loadAsync({ uri: src }, { shouldPlay: true, positionMillis: 0 }, true);
      await s.setProgressUpdateIntervalAsync(250);

      entry.onLoading(false);
    } catch (e) {
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

  const pause = async () => {
    if (!sound) return;
    try {
      await sound.pauseAsync();
    } catch (e) {
      Sentry.captureException(e);
    }
  };

  const resume = async () => {
    if (!sound) return;
    try {
      await sound.playAsync();
    } catch (e) {
      Sentry.captureException(e);
    }
  };

  const seekTo = async (ms: number) => {
    if (!sound) return;
    try {
      await sound.setPositionAsync(Math.max(0, Math.floor(ms)));
    } catch (e) {
      Sentry.captureException(e);
    }
  };

  const playNextAfter = async (id: string) => {
    if (currentId !== id) return;

    const idx = order.indexOf(id);
    const nextId = idx >= 0 ? order[idx + 1] ?? null : null;

    if (!nextId) {
      await stopAndUnloadIfCurrent(id);
      return;
    }

    await playById(nextId);
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
    isCurrent,
    getCurrentKey,
  };
})();

const probeDurationMs = async (uri: string): Promise<number> => {
  try {
    const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: false }, undefined, false);
    const st = await sound.getStatusAsync();
    await sound.unloadAsync();
    if (st.isLoaded && typeof (st as any).durationMillis === 'number') return (st as any).durationMillis ?? 0;
    return 0;
  } catch {
    return 0;
  }
};

export const AudioBubblePlayer = React.memo((props: AudioBubbleProps) => {
  const { audioSrc, variant, id } = props;

  const dispatch = useDispatch();
  const currentPlayingKey = useAppSelector(selectCurrentPlayingAudioSrc);

  const [isSoundLoading, setIsSoundLoading] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [convertedAudioSrc, setConvertedAudioSrc] = useState(audioSrc);

  const [currentTime, setCurrentTime] = useState('00:00');
  const [totalTime, setTotalTime] = useState('00:00');

  const currentPosition = useSharedValue(0);
  const totalDuration = useSharedValue(0);

  const idRef = useRef(`ab_${id}`);
  const durationLoadedRef = useRef(false);
  const lastStatusRef = useRef<AVPlaybackStatus | null>(null);
  const endedGuardRef = useRef(false);

  const key = useMemo(() => `${id}::${convertedAudioSrc}`, [id, convertedAudioSrc]);

  useEffect(() => {
    const prepare = async () => {
      setConvertedAudioSrc(audioSrc);

      const isOggLike = /\.(ogg|oga|opus)$/i.test(audioSrc);
      if (Platform.OS === 'ios' && isOggLike) {
        setIsSoundLoading(true);
        try {
          const converted = await convertOggToWav(audioSrc);
          const normalized = typeof (converted as any)?.uri === 'string' ? (converted as any).uri : converted;
          setConvertedAudioSrc(typeof normalized === 'string' ? normalized : audioSrc);
        } catch (e) {
          Sentry.captureException(e);
          setConvertedAudioSrc(audioSrc);
        } finally {
          setIsSoundLoading(false);
        }
      }
    };

    prepare();
  }, [audioSrc]);

  useEffect(() => {
    durationLoadedRef.current = false;
    currentPosition.value = 0;
    totalDuration.value = 0;
    setIsAudioPlaying(false);
    setCurrentTime('00:00');
    setTotalTime('00:00');

    let cancelled = false;
    probeDurationMs(convertedAudioSrc).then((d) => {
      if (cancelled) return;
      if (d > 0) {
        durationLoadedRef.current = true;
        totalDuration.value = d;
        setTotalTime(formatTime(d));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [convertedAudioSrc, currentPosition, totalDuration]);

  const onStatus = useCallback(
    (st: AVPlaybackStatus) => {
      lastStatusRef.current = st;

      if (!st.isLoaded) {
        setIsAudioPlaying(false);
        return;
      }

      const pos = (st as any).positionMillis ?? 0;
      const dur = (st as any).durationMillis ?? 0;
      const playing = (st as any).isPlaying ?? false;

      currentPosition.value = pos;
      setCurrentTime(formatTime(pos));
      setIsAudioPlaying(!!playing);

      if (dur > 0) {
        if (!durationLoadedRef.current || totalDuration.value !== dur) {
          durationLoadedRef.current = true;
          totalDuration.value = dur;
          setTotalTime(formatTime(dur));
        }
      }
    },
    [currentPosition, totalDuration],
  );

  useEffect(() => {
    PlayerHub.register({
      id: idRef.current,
      getSrc: () => convertedAudioSrc,
      getKey: () => key,
      onLoading: setIsSoundLoading,
      onStatus,
      onEnded: async () => {
        if (endedGuardRef.current) return;
        endedGuardRef.current = true;

        setIsAudioPlaying(false);
        dispatch(setCurrentPlayingAudioSrc(''));
        currentPosition.value = 0;
        setCurrentTime('00:00');

        await PlayerHub.enqueue(() => PlayerHub.playNextAfter(idRef.current));

        const nextKey = PlayerHub.getCurrentKey();
        if (nextKey) dispatch(setCurrentPlayingAudioSrc(nextKey));

        endedGuardRef.current = false;
      },
    });

    return () => {
      PlayerHub.unregister(idRef.current);

      PlayerHub.enqueue(async () => {
        if (PlayerHub.isCurrent(idRef.current)) {
          await PlayerHub.stopAndUnloadIfCurrent(idRef.current);
          dispatch(setCurrentPlayingAudioSrc(''));
        }
      });
    };
  }, [convertedAudioSrc, dispatch, currentPosition, key, onStatus]);

  const isThisCurrent = useMemo(
    () => currentPlayingKey === key && PlayerHub.isCurrent(idRef.current),
    [currentPlayingKey, key],
  );

  useEffect(() => {
    if (!isThisCurrent) {
      setIsAudioPlaying(false);
      currentPosition.value = 0;
      setCurrentTime('00:00');
    }
  }, [isThisCurrent, currentPosition]);

  const togglePlayback = useCallback(async () => {
    if (!convertedAudioSrc) return;

    await PlayerHub.enqueue(async () => {
      try {
        if (isThisCurrent) {
          const st = lastStatusRef.current;
          const playing = st && (st as any).isLoaded ? (st as any).isPlaying : isAudioPlaying;

          if (playing) {
            PlayerHub.suppressNextOnce(idRef.current);
            await PlayerHub.pause();
          } else {
            await PlayerHub.resume();
          }
          return;
        }

        setIsSoundLoading(true);
        await PlayerHub.playById(idRef.current);
        setIsSoundLoading(false);
        dispatch(setCurrentPlayingAudioSrc(key));
      } catch (e) {
        setIsSoundLoading(false);
        Sentry.captureException(e);
      }
    });
  }, [convertedAudioSrc, dispatch, isThisCurrent, isAudioPlaying, key]);

  const manualSeekTo = useCallback(
    async (manualSeekPositionMs: number) => {
      await PlayerHub.enqueue(async () => {
        const max = totalDuration.value > 0 ? totalDuration.value : manualSeekPositionMs;
        const next = Math.max(0, Math.min(manualSeekPositionMs, max));

        currentPosition.value = next;
        setCurrentTime(formatTime(next));

        await PlayerHub.seekTo(next);

        if (isThisCurrent) {
          const st = lastStatusRef.current;
          const playing = st && (st as any).isLoaded ? (st as any).isPlaying : isAudioPlaying;
          if (!playing) await PlayerHub.resume();
        }
      });
    },
    [currentPosition, totalDuration, isThisCurrent, isAudioPlaying],
  );

  const pauseAudio = useCallback(async () => {
    await PlayerHub.enqueue(async () => {
      PlayerHub.suppressNextOnce(idRef.current);
      await PlayerHub.pause();
    });
  }, []);

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
          <Animated.View>
            <Spinner size={13} stroke={variant === MESSAGE_VARIANTS.USER ? 'white' : 'black'} />
          </Animated.View>
        ) : isCurrentAudioPlaying ? (
          <Animated.View style={tailwind.style('pl-0.5 pr-0.5')} entering={FadeIn} exiting={FadeOut}>
            <PauseIcon
              fillOpacity={variant === MESSAGE_VARIANTS.USER ? '1' : '0.565'}
              fill={variant === MESSAGE_VARIANTS.USER ? 'white' : 'black'}
            />
          </Animated.View>
        ) : (
          <Animated.View style={tailwind.style('pl-0.5 pr-0.5')} entering={FadeIn} exiting={FadeOut}>
            <PlayIcon
              fillOpacity={variant === MESSAGE_VARIANTS.USER ? '1' : '0.565'}
              fill={variant === MESSAGE_VARIANTS.USER ? 'white' : 'black'}
            />
          </Animated.View>
        )}
      </Pressable>

      <Slider {...sliderProps} />

      <View style={tailwind.style('w-10 flex-row justify-end')}>
        <Text
          style={tailwind.style(
            'text-xs font-inter-420-20',
            variant === MESSAGE_VARIANTS.USER ? 'text-whiteA-A11' : 'text-gray-700',
            !isCurrentAudioPlaying ? 'hidden' : '',
          )}>
          {currentTime}
        </Text>
        <Text
          style={tailwind.style(
            'text-xs font-inter-420-20',
            variant === MESSAGE_VARIANTS.USER ? 'text-whiteA-A11' : 'text-gray-700',
            isCurrentAudioPlaying ? 'hidden' : '',
          )}>
          {totalTime}
        </Text>
      </View>
    </View>
  );
});

export const AudioBubble = React.memo<AudioBubbleProps>((props) => {
  const { audioSrc, variant, id } = props;

  return (
    <Animated.View style={tailwind.style('w-full flex flex-row items-center')}>
      <AudioBubblePlayer id={id} audioSrc={audioSrc} variant={variant} />
    </Animated.View>
  );
});
