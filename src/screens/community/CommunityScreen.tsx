import React, { useRef } from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import { WebView } from 'react-native-webview';
import { StackActions, useNavigation } from '@react-navigation/native';

import { Icon } from '@/components-next';
import { CloseIcon } from '@/svg-icons';
import { tailwind } from '@/theme';

const CommunityScreen = () => {
  const navigation = useNavigation();
  const webviewRef = useRef<WebView>(null);

  const handleBackPress = () => {
    navigation.dispatch(StackActions.pop());
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
      <WebView
        ref={webviewRef}
        originWhitelist={['*']}
        source={{ uri: 'https://wps.apps.buddyhelp.org/' }}
        startInLoadingState={true}
        javaScriptEnabled={true}
      />
    </Animated.View>
  );
};

export default CommunityScreen;