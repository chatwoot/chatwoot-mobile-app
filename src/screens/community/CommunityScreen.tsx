import React, { useState } from 'react';
import { Pressable, ActivityIndicator } from 'react-native';
import Animated from 'react-native-reanimated';
import { WebView } from 'react-native-webview';
import { StackActions, useNavigation } from '@react-navigation/native';

import { Icon } from '@/components-next';
import { CloseIcon } from '@/svg-icons';
import { tailwind } from '@/theme';

const CommunityScreen = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleBackPress = () => {
    navigation.dispatch(StackActions.pop());
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <Animated.View style={tailwind.style('flex-1')}>
      <Animated.View
        style={tailwind.style(
          'flex flex-row items-center justify-between px-4 border-b-[1px] border-b-blackA-A3 py-[12px] bg-white',
        )}>
        <Pressable hitSlop={16} onPress={handleBackPress}>
          <Animated.View>
            <Icon icon={<CloseIcon />} size={24} />
          </Animated.View>
        </Pressable>
        <Animated.View>
          <Animated.Text
            style={tailwind.style(
              'text-[17px] font-inter-medium-24 tracking-[0.32px] text-gray-950',
            )}>
            Community
          </Animated.Text>
        </Animated.View>
        <Pressable style={tailwind.style('opacity-0')}>
          <Animated.View>
            <Icon icon={<CloseIcon />} size={24} />
          </Animated.View>
        </Pressable>
      </Animated.View>
      {isLoading && (
        <Animated.View style={tailwind.style('absolute inset-0 justify-center items-center')}>
          <ActivityIndicator size="large" color="#171717" />
        </Animated.View>
      )}
      {hasError ? (
        <Animated.View style={tailwind.style('flex-1 justify-center items-center px-4')}>
          <Animated.Text style={tailwind.style('text-gray-500 text-center mb-4')}>
            Failed to load community page
          </Animated.Text>
          <Pressable
            onPress={() => {
              setHasError(false);
              setIsLoading(true);
            }}
            style={tailwind.style('bg-blue-500 px-4 py-2 rounded')}>
            <Animated.Text style={tailwind.style('text-white')}>Retry</Animated.Text>
          </Pressable>
        </Animated.View>
      ) : (
        <WebView
          source={{ uri: 'https://wp.apps.buddyhelp.org/portal/' }}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
          onHttpError={handleError}
          userAgent="BuddyHelp Mobile App (iOS/Android)"
          allowsBackForwardNavigationGestures={true}
          bounces={false}
          scrollEnabled={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={false}
          mixedContentMode="compatibility"
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          style={tailwind.style('flex-1')}
        />
      )}
    </Animated.View>
  );
};

export default CommunityScreen;
