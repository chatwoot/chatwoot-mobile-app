import React from 'react';
import Animated from 'react-native-reanimated';

import { tailwind, useThemedStyles } from '@/theme';

type BottomSheetHeaderProps = {
  headerText: string;
};

export const BottomSheetHeader = (props: BottomSheetHeaderProps) => {
  const { headerText } = props;
  const styles = useThemedStyles();

  return (
    <Animated.View style={tailwind.style('flex-row justify-center items-center')}>
      <Animated.Text
        style={[
          tailwind.style('text-md font-inter-medium-24 leading-[17px] tracking-[0.32px]'),
          styles.textPrimary,
        ]}
      >
        {headerText}
      </Animated.Text>
    </Animated.View>
  );
};
