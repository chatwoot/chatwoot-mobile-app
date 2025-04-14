import React from 'react';
import { View } from 'react-native';
import { tailwind } from '@/theme';
import { Image } from 'expo-image';
import Animated, { FadeIn } from 'react-native-reanimated';
// eslint-disable-next-line
import typingGif from './typing.gif';

type TypingIndicatorProps = {
  typingText: string;
};

export const TypingIndicator = ({ typingText }: TypingIndicatorProps) => {
  return (
    <Animated.View
      entering={FadeIn.duration(350)}
      style={tailwind.style('my-[1px] mb-2 items-start')}>
      <View style={tailwind.style('flex flex-row')}>
        <View
          style={tailwind.style(
            'relative rounded-2xl overflow-hidden bg-gray-100 pl-3 pr-2.5 py-2',
          )}>
          <Image source={typingGif} style={tailwind.style('w-6 h-6')} contentFit="contain" />
        </View>
      </View>
    </Animated.View>
  );
};
