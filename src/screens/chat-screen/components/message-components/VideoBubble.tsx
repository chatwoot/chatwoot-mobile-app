import React, { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable } from 'react-native';
import Animated, { Easing, FadeIn, FadeOut } from 'react-native-reanimated';
import {
  AVPlaybackStatus,
  ResizeMode,
  Video,
  VideoFullscreenUpdate,
  VideoFullscreenUpdateEvent,
} from 'expo-av';
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
  const video = React.useRef<Video>(null);
  const [playVideo, setPlayVideo] = useState(false);

  const [videoLoading, setVideoLoading] = useState(true);

  const [videoStatus, setVideoStatus] = React.useState<AVPlaybackStatus | null>(null);
  const handlePlayPress = () => {
    setPlayVideo(true);
    video.current?.presentFullscreenPlayer();
    video.current?.playAsync();
  };

  useEffect(() => {
    if (videoStatus?.isLoaded) {
      if (videoStatus?.didJustFinish) {
        video.current?.playFromPositionAsync(0);
        setPlayVideo(false);
      }
    }
  }, [videoStatus]);

  const handlePlaybackStatus = (status: AVPlaybackStatus) => {
    setVideoStatus(status);
  };

  const handleOnFullScreenUpdate = (event: VideoFullscreenUpdateEvent) => {
    if (event.fullscreenUpdate === VideoFullscreenUpdate.PLAYER_WILL_DISMISS) {
      setPlayVideo(false);
    }
  };

  // To have a loader while the Video is loaded, and
  // thumbnail is shown
  const handleOnLoadStart = useCallback(() => {
    setVideoLoading(true);
  }, []);

  const handleOnLoad = useCallback(() => {
    setVideoLoading(false);
  }, []);

  return (
    <React.Fragment>
      <Video
        style={tailwind.style('w-full ios:h-full aspect-video')}
        ref={video}
        source={{
          uri: videoSrc,
        }}
        shouldPlay={playVideo}
        resizeMode={Platform.OS === 'android' ? ResizeMode.CONTAIN : ResizeMode.COVER}
        onLoadStart={handleOnLoadStart}
        onLoad={handleOnLoad}
        onPlaybackStatusUpdate={handlePlaybackStatus}
        onFullscreenUpdate={handleOnFullScreenUpdate}
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
