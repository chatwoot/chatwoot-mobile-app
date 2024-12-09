import React from 'react';
import { Text } from 'react-native';

import { tailwind } from '@/theme';
import { NativeView } from '@/components-next/native-components';

type TypingMessageProps = {
  typingText: string;
};

export const TypingMessage = (props: TypingMessageProps) => {
  const { typingText } = props;
  return (
    <NativeView style={tailwind.style('flex-1 flex-row gap-1 items-start')}>
      <Text
        numberOfLines={1}
        style={tailwind.style(
          'text-md flex-1 font-inter-420-20 tracking-[0.32px] leading-[21px] text-green-800',
        )}>
        {typingText}
      </Text>
    </NativeView>
  );
};
