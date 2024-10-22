import React from 'react';
import Animated from 'react-native-reanimated';

import { tailwind } from '@/theme';

type BottomSheetHeaderProps = {
  headerText: string;
};

export const BottomSheetHeader = (props: BottomSheetHeaderProps) => {
  const { headerText } = props;
  return (
    <Animated.View style={tailwind.style('flex-row justify-center items-center')}>
      <Animated.Text
        style={tailwind.style(
          'text-gray-700 text-md font-inter-medium-24 leading-[17px] tracking-[0.32px]',
        )}>
        {headerText}
      </Animated.Text>
    </Animated.View>
  );
};
