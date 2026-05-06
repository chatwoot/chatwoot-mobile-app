import React, { useCallback, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { Pressable } from 'react-native-gesture-handler';

import Animated, { Easing, FadeIn, FadeOut } from 'react-native-reanimated';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEventListener } from 'expo';
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
  const videoViewRef = useRef<VideoView>(null);
  const [playVideo, setPlayVideo] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);

  const player = useVideoPlayer(videoSrc, player => {
    player.loop = false;
  });

  useEventListener(player, 'statusChange', ({ status }) => {
    if (status === 'readyToPlay') {
      setVideoLoading(false);
    } else if (status === 'loading') {
      setVideoLoading(true);
    }
  });

  useEventListener(player, 'playToEnd', () => {
    player.currentTime = 0;
    setPlayVideo(false);
  });

  const handlePlayPress = useCallback(() => {
    setPlayVideo(true);
    videoViewRef.current?.enterFullscreen();
    player.play();
  }, [player]);

  const handleFullscreenExit = useCallback(() => {
    setPlayVideo(false);
    player.pause();
  }, [player]);

  return (
    <React.Fragment>
      <VideoView
        ref={videoViewRef}
        player={player}
        style={tailwind.style('w-full ios:h-full aspect-video')}
        contentFit={Platform.OS === 'android' ? 'contain' : 'cover'}
        nativeControls={false}
        fullscreenOptions={{ enable: true }}
        onFullscreenExit={handleFullscreenExit}
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

export const VideoBubble = (props: VideoBubbleProps) => {
  const { videoSrc } = props;

  return (
    <React.Fragment>
      <VideoBubblePlayer
        {...{
          videoSrc,
        }}
      />
      {/* TODO: Fix this */}
      {/* <Animated.View
        pointerEvents={'none'}
        entering={FadeIn.duration(300).easing(Easing.ease)}
        exiting={FadeOut.duration(300).easing(Easing.ease)}>
        <ImageBackground
          source={require('../../../../assets/local/ImageCellTimeStampOverlay.png')}
          style={tailwind.style(
            'absolute bottom-0 right-0 h-15 w-33 z-20 ',
            shouldRenderAvatar
              ? isOutgoing
                ? 'rounded-br-none'
                : isIncoming
                  ? 'rounded-bl-none'
                  : ''
              : '',
          )}>
          <Animated.View style={tailwind.style('flex flex-row absolute right-3 bottom-[5px]')}>
            <Text
              style={tailwind.style(
                'text-xs font-inter-420-20 tracking-[0.32px] leading-[14px] text-whiteA-A12 pr-1',
              )}>
              {unixTimestampToReadableTime(timeStamp)}
            </Text>
            <DeliveryStatus
              isPrivate={isPrivate}
              status={status}
              messageType={messageType}
              channel={channel}
              errorMessage={errorMessage || ''}
              sourceId={sourceId}
            />
          </Animated.View>
        </ImageBackground>
      </Animated.View> */}
    </React.Fragment>
  );
};
