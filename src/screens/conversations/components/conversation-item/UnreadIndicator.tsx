import React from 'react';
import { Text } from 'react-native';

import { tailwind } from '@/theme';
import { NativeView } from '@/components-next/native-components';

type UnreadIndicatorProps = {
  count: number;
};

export const UnreadIndicator = (props: UnreadIndicatorProps) => {
  const { count } = props;
  return (
    <NativeView
      style={tailwind.style(
        'h-5 w-5 flex justify-center flex-shrink-0 items-center rounded-full bg-blue-700',
      )}>
      <Text
        style={tailwind.style(
          'text-xs font-inter-semibold-20 leading-[15px] text-center text-white',
        )}>
        {count > 9 ? '9+' : count}
      </Text>
    </NativeView>
  );
};
