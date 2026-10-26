import React from 'react';
import { Text } from 'react-native';

import { tailwind } from '@/theme';
import { NativeView } from '@/components-next/native-components';
import { IOS_LIST_TEXT, useIOSListText } from '@/utils';

type UnreadIndicatorProps = {
  count: number;
};

export const UnreadIndicator = (props: UnreadIndicatorProps) => {
  const iosText = useIOSListText();
  const { count } = props;
  return (
    <NativeView
      style={tailwind.style('h-5 w-5 flex justify-center items-center rounded-full bg-blue-700')}>
      <Text
        style={tailwind.style(
          'text-xs font-inter-semibold-20 leading-[15px] text-center text-white',
          iosText && IOS_LIST_TEXT.caption,
        )}>
        {count > 9 ? '9+' : count}
      </Text>
    </NativeView>
  );
};
