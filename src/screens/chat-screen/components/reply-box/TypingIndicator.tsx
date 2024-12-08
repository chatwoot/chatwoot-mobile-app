import React from 'react';
import { View, Text } from 'react-native';

import { tailwind } from '@/theme';
import { Image } from 'expo-image';

type TypingIndicatorProps = {
  typingText: string;
};

export const TypingIndicator = ({ typingText }: TypingIndicatorProps) => {
  return (
    <View style={tailwind.style('absolute w-full items-center -top-14')}>
      <View
        style={tailwind.style(
          'flex-row items-center py-1 px-2 shadow-md rounded-full bg-white my-1 mx-auto',
        )}>
        <Text
          style={tailwind.style(
            'text-cxs font-inter-medium-24 tracking-[0.32px] leading-[18px] text-blackA-A11 text-center',
          )}>
          {typingText}
        </Text>
        <Image
          source={require('../../../../assets/local/typing.gif')}
          style={tailwind.style('w-8 h-8 ml-2')}
          contentFit="contain"
        />
      </View>
    </View>
  );
};
