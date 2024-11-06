import React from 'react';
import { Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { tailwind } from '@/theme';
import { NativeView } from '@/components-next/native-components';

// Numerical Label with the Hash Icon
export const HashIcon = () => {
  return (
    <Svg width="11" height="10" viewBox="0 0 11 10" fill="none">
      <Path
        d="M4.5 0.5L2.99999 9.5M8.5 0.5L7.60312 6.83352M10 3H1.5M9.5 6.83352H1M7.31372 8.63122L7.19616 9.43262"
        stroke="#8F8F8F"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

type ConversationIdProps = {
  id: number;
};

export const ConversationId = (props: ConversationIdProps) => {
  const { id = 60 } = props;
  return (
    <NativeView style={tailwind.style('flex flex-row items-center pl-[5px]')}>
      <HashIcon />
      <Text
        style={tailwind.style(
          'text-sm font-inter-420-20 leading-[16px] tracking-[0.32px] text-gray-700 pl-0.5',
        )}>
        {id}
      </Text>
    </NativeView>
  );
};
