import React, { useCallback, useEffect, useRef, useState } from 'react';
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
  videoSrc: string; // The source URI of the video to display.
  width?: number; // Optional maximum width for the video bubble.
};

type VideoPlayerProps = Pick<VideoBubbleProps, 'videoSrc' | 'width'>; // Inherit videoSrc and width from VideoBubbleProps.

export const VideoBubblePlayer = (props: VideoPlayerProps) => {
  const { videoSrc, width: videoMaxWidth } = props;
  const video = React.useRef<Video>(null); // Ref to access the Video component instance.
  const [playVideo, setPlayVideo] = useState(false); // State to control video playback (play/pause).

  const [videoLoading, setVideoLoading] = useState(true); // State to indicate if the video is loading.
  // State to store the calculated width and height of the video to maintain aspect ratio.
  // Defaults to a placeholder size before the actual dimensions are determined.
  const [videoSize, setVideoSize] = useState({ width: 300, height: 215 });

  const handlePlayPress = () => {
    setPlayVideo(true);
    video.current?.presentFullscreenPlayer(); // Present the video in fullscreen.
    video.current?.playAsync(); // Start video playback asynchronously.
  };

  const handleOnFullScreenUpdate = (event: VideoFullscreenUpdateEvent) => {
    // If the fullscreen player is dismissed, stop playback.
    if (event.fullscreenUpdate === VideoFullscreenUpdate.PLAYER_WILL_DISMISS) {
      setPlayVideo(false);
    }
  };

  // Callback when video loading starts, sets loading state to true.
  const handleOnLoadStart = useCallback(() => {
    setVideoLoading(true);
  }, []);

  /**
   * Callback when the video finishes loading.
   * This is primarily used to set the videoLoading state to false.
   * Note: Video dimensions are handled by `onReadyForDisplay`.
   */
  const handleOnLoad = useCallback(() => {
    setVideoLoading(false);
  }, []);

  // Callback for general playback status updates.
  // This is used for checking `didJustFinish` to loop or reset playback.
  const handlePlaybackStatus = useCallback((status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      if (status.didJustFinish) {
        video.current?.playFromPositionAsync(0);
        setPlayVideo(false);
      }
    }
  }, []);


  return (
    <React.Fragment>
      <Video
        // Apply dynamically calculated width and height to maintain aspect ratio.
        style={[
          tailwind.style('bg-gray-100 overflow-hidden rounded-lg'),
          { width: videoSize.width, height: videoSize.height },
        ]}
        ref={video}
        source={{
          uri: videoSrc,
        }}
        shouldPlay={playVideo} // Control playback based on local state.
        resizeMode={Platform.OS === 'android' ? ResizeMode.CONTAIN : ResizeMode.COVER} // Ensure the video fits within its bounds without cropping.
        onLoadStart={handleOnLoadStart} // Callback for when video starts loading.
        onLoad={handleOnLoad} // Callback for when video finishes loading.
        onPlaybackStatusUpdate={handlePlaybackStatus} // Callback for general playback status updates.
        onFullscreenUpdate={handleOnFullScreenUpdate} // Callback for fullscreen events.
        onReadyForDisplay={(e) => {
          // This callback is fired when the video is ready to be displayed.
          // It provides the natural size of the video, which is used to calculate the bubble dimensions.
          const { width, height } = e.naturalSize;
          const maxWidth = videoMaxWidth || 300; // Use provided max width or default.
          const aspectRatio = width / height;
          const calculatedHeight = maxWidth / aspectRatio; // Calculate height.
          setVideoSize({ width: maxWidth, height: calculatedHeight });
        }}
      />
      {videoLoading ? (
        // Show spinner while video is loading.
        <Animated.View style={tailwind.style('absolute inset-0 flex items-center justify-center')}>
          <Spinner size={20} />
        </Animated.View>
      ) : null}
      {!playVideo ? (
        // Show play icon overlay if video is not playing.
        <Animated.View
          entering={FadeIn.duration(300).easing(Easing.ease)}
          exiting={FadeOut.duration(300).easing(Easing.ease)}
          style={tailwind.style('absolute inset-0 flex items-center justify-center')}>
          <Pressable
            onPress={handlePlayPress} // Handle play button press.
            style={tailwind.style('h-full w-full flex items-center justify-center')}>
            <Image
              source={require('../../../../assets/local/PlayIcon.png')} // Play icon image.
              style={tailwind.style('h-12 w-12 z-10')}
            />
          </Pressable>
        </Animated.View>
      ) : null}
    </React.Fragment>
  );
};

export const VideoBubble = (props: VideoBubbleProps) => {
  const { videoSrc, width } = props;

  return (
    <React.Fragment>
      {/* Renders the VideoBubblePlayer component, passing down relevant props including calculated width. */}
      <VideoBubblePlayer
        {...{
          videoSrc,
          width,
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
