import React from 'react';
import { View } from 'react-native';

import { tailwind } from '@/theme';
import { Image } from 'expo-image';

type TypingIndicatorProps = {
  typingText: string;
};

export const TypingIndicator = ({ typingText }: TypingIndicatorProps) => {
  return (
    <View style={tailwind.style('w-full items-center mb-16')}>
      <View
        style={tailwind.style(
          'flex-row items-center py-1 px-2 shadow-md rounded-xl bg-white mx-auto',
        )}>
        <Image
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          source={require('./typing.gif')}
          style={tailwind.style('w-6 h-6')}
          contentFit="contain"
        />
      </View>
    </View>
  );
};
