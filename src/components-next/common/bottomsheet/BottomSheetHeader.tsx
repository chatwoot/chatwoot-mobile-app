import { useTailwind } from '@/theme/useTailwind';
import React from 'react';
import Animated from 'react-native-reanimated';

type BottomSheetHeaderProps = {
  headerText: string;
};

export const BottomSheetHeader = (props: BottomSheetHeaderProps) => {
  const tailwind = useTailwind();
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
