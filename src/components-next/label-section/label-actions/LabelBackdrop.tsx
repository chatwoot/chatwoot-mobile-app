import React from 'react';
import { Pressable } from 'react-native';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';
import { BottomSheetBackgroundProps, BottomSheetModal } from '@gorhom/bottom-sheet';

import { tailwind } from '@/theme';

interface LabelBackdropProps extends BottomSheetBackgroundProps {
  sheetRef: React.RefObject<BottomSheetModal>;
}

export const LabelBackdrop: React.FC<LabelBackdropProps> = props => {
  const { animatedIndex, style, sheetRef } = props;

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(animatedIndex.value, [-1, 0], [0, 1]),
    };
  });

  const handleBackdropPress = () => {
    sheetRef.current?.dismiss({ overshootClamping: true });
  };

  return (
    <Pressable onPress={handleBackdropPress} style={style}>
      <Animated.View style={[tailwind.style('bg-blackA-A9'), style, animatedStyle]} />
    </Pressable>
  );
};
