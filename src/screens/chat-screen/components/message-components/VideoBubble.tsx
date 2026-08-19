import React, { useEffect, useRef, useState } from 'react';
import { Platform, Pressable } from 'react-native';
import Animated, { Easing, FadeIn, FadeOut } from 'react-native-reanimated';
import { useVideoPlayer, VideoView, type VideoPlayerStatus } from 'expo-video';
import { Image } from 'expo-image';
import { tailwind } from '@/theme';
import { Spinner } from '@/components-next/spinner';

type VideoBubbleProps = {
  videoSrc: string;
};

type VideoPlayerProps = Pick<VideoBubbleProps, 'videoSrc'> & {
  playerEnabled?: boolean;
};

export const VideoBubblePlayer = (props: VideoPlayerProps) => {
  const { videoSrc, playerEnabled = true } = props;
  const videoRef = useRef<VideoView>(null);
  const [playVideo, setPlayVideo] = useState(false);
  const [status, setStatus] = useState<VideoPlayerStatus>('loading');

  const player = useVideoPlayer({ uri: videoSrc }, instance => {
    instance.loop = false;
  });

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

  // Loader shown over the thumbnail until the first frame is ready.
  const videoLoading = status === 'loading' || status === 'idle';

  const handlePlayPress = async () => {
    setPlayVideo(true);
    player.play();
    await videoRef.current?.enterFullscreen();
  };

  return (
    <React.Fragment>
      <VideoView
        style={tailwind.style('w-full ios:h-full aspect-video')}
        ref={videoRef}
        player={player}
        contentFit={Platform.OS === 'android' ? 'contain' : 'cover'}
        nativeControls={playerEnabled}
        onFullscreenExit={() => {
          player.pause();
          setPlayVideo(false);
        }}
      />
      {videoLoading ? (
        <Animated.View style={tailwind.style('absolute inset-0 flex items-center justify-center')}>
          <Spinner size={20} />
        </Animated.View>
      ) : null}
      {!playVideo && playerEnabled ? (
        <Animated.View
          entering={FadeIn.duration(300).easing(Easing.ease)}
          exiting={FadeOut.duration(300).easing(Easing.ease)}
          style={tailwind.style('absolute inset-0 flex items-center justify-center')}>
          <Pressable
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
  const { videoSrc } = props;
  const videoRef = useRef<VideoView>(null);
  const [status, setStatus] = useState<VideoPlayerStatus>('loading');

  const player = useVideoPlayer({ uri: videoSrc }, instance => {
    instance.loop = false;
  });

  useEffect(() => {
    const statusSub = player.addListener('statusChange', ({ status: nextStatus }) => {
      setStatus(nextStatus);
    });
    setStatus(player.status);
    return () => {
      statusSub.remove();
    };
  }, [player]);

  const handlePlayPress = async () => {
    player.play();
    await videoRef.current?.enterFullscreen();
  };

  return (
    <Animated.View
      style={tailwind.style('h-[72px] w-[72px] rounded-xl bg-gray-100 overflow-hidden')}>
      <VideoView
        style={tailwind.style('h-full w-full')}
        ref={videoRef}
        player={player}
        contentFit="cover"
        nativeControls={false}
        onFullscreenExit={() => {
          player.pause();
          player.currentTime = 0;
        }}
      />
      {status === 'loading' || status === 'idle' ? (
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
