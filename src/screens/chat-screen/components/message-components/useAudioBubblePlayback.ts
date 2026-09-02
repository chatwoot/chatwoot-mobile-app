import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { AudioPlayer, AudioStatus, createAudioPlayer } from 'expo-audio';
import { useSharedValue } from 'react-native-reanimated';
import * as Sentry from '@sentry/react-native';

// eslint-disable-next-line import/no-unresolved
import { preparePlayableAudio } from '@/utils/audioConverter';
import { AudioAttachmentSource } from '@/utils/audioSource';
import { ensurePlaybackAudioMode } from '@/utils/audioSession';

import { claimPlayback, PlaybackOwner, releasePlayback } from './audioPlaybackController';

export type AudioPlaybackState = 'idle' | 'loading' | 'playing' | 'paused' | 'failed';

const STATUS_UPDATE_INTERVAL_MS = 250;

// Android reports decoder and network failures through an `error` field that
// the public status type omits; iOS reports them as `playbackState: 'failed'`.
const isFailedStatus = (status: AudioStatus) =>
  status.playbackState === 'failed' || Boolean((status as { error?: string | null }).error);

/**
 * Owns one expo-audio player for a single attachment. The player is created
 * on the first play so an unplayed bubble costs nothing, and it is released
 * only when this bubble unmounts or switches to another attachment.
 */
export const useAudioBubblePlayback = (source: AudioAttachmentSource) => {
  const [state, setState] = useState<AudioPlaybackState>('idle');
  const currentPosition = useSharedValue(0);
  const totalDuration = useSharedValue(0);

  const playerRef = useRef<AudioPlayer | null>(null);
  const subscriptionRef = useRef<{ remove: () => void } | null>(null);
  // Identifies the attachment a pending preparation belongs to, so a bubble
  // recycled for another message drops the result of the previous one.
  const sourceKeyRef = useRef(source.dataUrl);
  const ownerRef = useRef<PlaybackOwner>({ pause: () => {} });

  const pause = useCallback(() => {
    playerRef.current?.pause();
    setState(prev => (prev === 'playing' || prev === 'loading' ? 'paused' : prev));
  }, []);
  ownerRef.current.pause = pause;

  const releasePlayer = useCallback(() => {
    subscriptionRef.current?.remove();
    subscriptionRef.current = null;
    playerRef.current?.remove();
    playerRef.current = null;
    releasePlayback(ownerRef.current);
    currentPosition.value = 0;
    totalDuration.value = 0;
  }, [currentPosition, totalDuration]);

  const handleStatus = useCallback(
    (status: AudioStatus) => {
      if (isFailedStatus(status)) {
        setState('failed');
        return;
      }
      if (status.duration > 0) {
        totalDuration.value = status.duration;
      }
      currentPosition.value = status.currentTime;

      if (status.didJustFinish) {
        currentPosition.value = 0;
        // ExoPlayer keeps playWhenReady after the end of the track, so seeking
        // back without pausing would start it again.
        playerRef.current?.pause();
        playerRef.current?.seekTo(0);
        releasePlayback(ownerRef.current);
        setState('paused');
        return;
      }
      setState(prev => {
        if (status.playing) {
          return 'playing';
        }
        if (status.isBuffering) {
          return prev;
        }
        return prev === 'playing' ? 'paused' : prev;
      });
    },
    [currentPosition, totalDuration],
  );

  useEffect(() => {
    sourceKeyRef.current = source.dataUrl;
    setState('idle');
    return releasePlayer;
  }, [source.dataUrl, releasePlayer]);

  const startPlayer = useCallback(async () => {
    const sourceKey = source.dataUrl;
    setState('loading');
    try {
      const uri = Platform.OS === 'ios' ? await preparePlayableAudio(source) : source.dataUrl;
      await ensurePlaybackAudioMode();
      if (sourceKeyRef.current !== sourceKey) {
        return;
      }
      const player = createAudioPlayer({ uri }, { updateInterval: STATUS_UPDATE_INTERVAL_MS });
      subscriptionRef.current = player.addListener('playbackStatusUpdate', handleStatus);
      playerRef.current = player;
      claimPlayback(ownerRef.current);
      player.play();
    } catch (error) {
      Sentry.captureException(error);
      if (sourceKeyRef.current === sourceKey) {
        setState('failed');
      }
    }
  }, [source, handleStatus]);

  const toggle = useCallback(() => {
    if (state === 'loading') {
      return;
    }
    if (state === 'playing') {
      pause();
      return;
    }
    if (playerRef.current && state !== 'failed') {
      claimPlayback(ownerRef.current);
      playerRef.current.play();
      setState('playing');
      return;
    }
    releasePlayer();
    startPlayer();
  }, [state, pause, releasePlayer, startPlayer]);

  const seekTo = useCallback(
    async (seconds: number) => {
      const player = playerRef.current;
      if (!player) {
        return;
      }
      await player.seekTo(seconds);
      currentPosition.value = seconds;
      claimPlayback(ownerRef.current);
      player.play();
      setState('playing');
    },
    [currentPosition],
  );

  return { state, currentPosition, totalDuration, toggle, pause, seekTo };
};
