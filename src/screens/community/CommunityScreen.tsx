import React, { useState } from 'react';
import { Pressable, ActivityIndicator } from 'react-native';
import Animated from 'react-native-reanimated';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { tailwind } from '@/theme';

const CommunityScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const insets = useSafeAreaInsets();

  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <Animated.View style={tailwind.style('flex-1 bg-white')}>
      <Animated.View
        style={[
          tailwind.style('flex-1 overflow-hidden'),
          {
            marginTop: insets.top,
            marginBottom: insets.bottom,
          },
        ]}>
        {isLoading && (
          <Animated.View
            style={tailwind.style('absolute inset-0 justify-center items-center z-10')}>
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
    </Animated.View>
  );
};

export default CommunityScreen;
