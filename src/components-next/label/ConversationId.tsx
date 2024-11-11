import React from 'react';
import { Text } from 'react-native';

import { tailwind } from '@/theme';
import { NativeView } from '@/components-next/native-components';

type ConversationIdProps = {
  id: number;
};

export const ConversationId = (props: ConversationIdProps) => {
  const { id = 60 } = props;
  return (
    <NativeView style={tailwind.style('flex flex-row items-center pl-[5px]')}>
      <Text
        style={tailwind.style(
          'text-sm font-inter-420-20 leading-[16px] tracking-[0.32px] text-gray-700 pl-0.5',
        )}>
        #{id}
      </Text>
    </NativeView>
  );
};
