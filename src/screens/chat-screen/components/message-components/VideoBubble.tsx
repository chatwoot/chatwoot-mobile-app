import { useTailwind } from '@/theme/useTailwind';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable } from 'react-native';
import Animated, { Easing, FadeIn, FadeOut } from 'react-native-reanimated';
import { useVideoPlayer, VideoView, type VideoPlayerStatus } from 'expo-video';
import { Image } from 'expo-image';
import { Spinner } from '@/components-next/spinner';
import { useCloudflareMedia } from '@/hooks/useCloudflareMedia';
import i18n from '@/i18n';

type VideoBubbleProps = {
  videoSrc: string;
};

type VideoPlayerProps = Pick<VideoBubbleProps, 'videoSrc'> & {
  playerEnabled?: boolean;
};

// External video keeps its native streaming path. Protected video is resolved
// only after Play, so a message list never downloads full videos to draw cells.
const useDeferredVideo = (videoSrc: string) => {
  const [requestedSource, setRequestedSource] = useState<string | null>(null);
  const media = useCloudflareMedia(videoSrc, 0, requestedSource === videoSrc);
  const videoRef = useRef<VideoView>(null);
  const [playVideo, setPlayVideo] = useState(false);
  const [playbackFailed, setPlaybackFailed] = useState(false);
  const [status, setStatus] = useState<VideoPlayerStatus>('loading');
  const pendingPlay = useRef<string | null>(null);

  const player = useVideoPlayer(media.uri ? { uri: media.uri } : null, instance => {
    instance.loop = false;
  });

  useEffect(() => {
    pendingPlay.current = null;
    setPlayVideo(false);
    setPlaybackFailed(false);
  }, [videoSrc]);

  useEffect(() => {
    const statusSub = player.addListener('statusChange', ({ status: nextStatus }) => {
      setStatus(nextStatus);
    });
    const endSub = player.addListener('playToEnd', () => {
      player.currentTime = 0;
      setPlayVideo(false);
    });
    // Sync the current status in case the player became ready before this subscription.
    setStatus(player.status);
    return () => {
      statusSub.remove();
      endSub.remove();
    };
  }, [player]);

  const beginPlayback = useCallback(() => {
    try {
      player.play();
      setPlayVideo(true);
      // Fullscreen can be unavailable while the view is being unmounted;
      // inline playback still works and no native error is reported.
      videoRef.current?.enterFullscreen().catch(() => {});
    } catch {
      setPlaybackFailed(true);
    }
  }, [player]);

  useEffect(() => {
    if (pendingPlay.current === videoSrc && media.uri && status === 'readyToPlay') {
      pendingPlay.current = null;
      beginPlayback();
    }
  }, [videoSrc, media.uri, status, beginPlayback]);

  const handlePlayPress = () => {
    if (media.uri && status === 'readyToPlay') {
      beginPlayback();
      return;
    }
    pendingPlay.current = videoSrc;
    setRequestedSource(videoSrc);
  };

  const failed = media.failed || playbackFailed || (!!media.uri && status === 'error');
  const loading =
    !failed && (media.loading || (!!media.uri && (status === 'loading' || status === 'idle')));

  return {
    media,
    player,
    videoRef,
    playVideo,
    setPlayVideo,
    loading,
    failed,
    handlePlayPress,
  };
};

export const VideoBubblePlayer = (props: VideoPlayerProps) => {
  const tailwind = useTailwind();
  const { videoSrc, playerEnabled = true } = props;
  const { media, player, videoRef, playVideo, setPlayVideo, loading, failed, handlePlayPress } =
    useDeferredVideo(videoSrc);

  return (
    <React.Fragment>
      <VideoView
        style={tailwind.style('w-full ios:h-full aspect-video')}
        ref={videoRef}
        player={player}
        contentFit={Platform.OS === 'android' ? 'contain' : 'cover'}
        nativeControls={playerEnabled && !!media.uri}
        onFullscreenExit={() => {
          player.pause();
          setPlayVideo(false);
        }}
      />
      {loading ? (
        <Animated.View style={tailwind.style('absolute inset-0 flex items-center justify-center')}>
          <Spinner size={20} />
        </Animated.View>
      ) : null}
      {failed ? (
        <Animated.Text style={tailwind.style('absolute inset-0 text-center text-gray-900')}>
          {i18n.t('CONVERSATION.FILE_LOAD_ERROR')}
        </Animated.Text>
      ) : null}
      {!loading && !failed && !playVideo && (playerEnabled || !media.uri) ? (
        <Animated.View
          entering={FadeIn.duration(300).easing(Easing.ease)}
          exiting={FadeOut.duration(300).easing(Easing.ease)}
          style={tailwind.style('absolute inset-0 flex items-center justify-center')}>
          <Pressable
            disabled={!playerEnabled}
            onPress={handlePlayPress}
            style={tailwind.style('h-full w-full flex items-center justify-center')}>
            <Image
              source={require('../../../../assets/local/PlayIcon.png')} // eslint-disable-line @typescript-eslint/no-require-imports
              style={tailwind.style('h-12 w-12 z-10')}
            />
          </Pressable>
        </Animated.View>
      ) : null}
    </React.Fragment>
  );
};

// Fixed-size media thumbnail. Playback is handed to the fullscreen player, so the
// inline view carries no controls.
export const VideoThumbnail = (props: VideoBubbleProps) => {
  const tailwind = useTailwind();
  const { videoSrc } = props;
  const { player, videoRef, setPlayVideo, loading, failed, handlePlayPress } =
    useDeferredVideo(videoSrc);
  // iOS fullscreen needs controls to close
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <Animated.View
      style={tailwind.style('h-[72px] w-[72px] rounded-xl bg-gray-100 overflow-hidden')}>
      <VideoView
        style={tailwind.style('h-full w-full')}
        ref={videoRef}
        player={player}
        contentFit="cover"
        nativeControls={Platform.OS === 'ios' && isFullscreen}
        onFullscreenEnter={() => setIsFullscreen(true)}
        onFullscreenExit={() => {
          setIsFullscreen(false);
          setPlayVideo(false);
          player.pause();
          player.currentTime = 0;
        }}
      />
      {failed ? (
        <Animated.Text style={tailwind.style('absolute inset-0 text-center text-gray-900')}>
          {i18n.t('CONVERSATION.FILE_LOAD_ERROR')}
        </Animated.Text>
      ) : loading ? (
        <Animated.View style={tailwind.style('absolute inset-0 flex items-center justify-center')}>
          <Spinner size={16} />
        </Animated.View>
      ) : (
        <Pressable
          onPress={handlePlayPress}
          style={tailwind.style('absolute inset-0 flex items-center justify-center')}>
          <Image
            source={require('../../../../assets/local/PlayIcon.png')} // eslint-disable-line @typescript-eslint/no-require-imports
            style={tailwind.style('h-7 w-7')}
          />
        </Pressable>
      )}
    </Animated.View>
  );
};

export const VideoBubble = (props: VideoBubbleProps) => {
  const { videoSrc } = props;

  return (
    <React.Fragment>
      <VideoBubblePlayer
        {...{
          videoSrc,
        }}
      />
    </React.Fragment>
  );
};
