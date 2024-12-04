import React from 'react';
import { Pressable } from 'react-native';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';
import { BottomSheetBackgroundProps } from '@gorhom/bottom-sheet';

import { useRefsContext } from '@/context';
import { tailwind } from '@/theme';

export const BottomSheetBackdrop: React.FC<BottomSheetBackgroundProps> = props => {
  const { animatedIndex, style } = props;

  const {
    filtersModalSheetRef,
    userAvailabilityStatusSheetRef,
    actionsModalSheetRef,
    addLabelSheetRef,
    languagesModalSheetRef,
    macrosListSheetRef,
    notificationPreferencesSheetRef,
    switchAccountSheetRef,
    debugActionsSheetRef,
    inboxFiltersSheetRef,
  } = useRefsContext();

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(animatedIndex.value, [-1, 0], [0, 1]),
    };
  });

  const handleBackdropPress = () => {
    userAvailabilityStatusSheetRef.current?.dismiss({
      overshootClamping: true,
    });
    filtersModalSheetRef.current?.dismiss({ overshootClamping: true });
    actionsModalSheetRef.current?.dismiss({ overshootClamping: true });
    addLabelSheetRef.current?.dismiss({ overshootClamping: true });
    languagesModalSheetRef.current?.dismiss({ overshootClamping: true });
    macrosListSheetRef.current?.dismiss({ overshootClamping: true });
    notificationPreferencesSheetRef.current?.dismiss({ overshootClamping: true });
    switchAccountSheetRef.current?.dismiss({ overshootClamping: true });
    debugActionsSheetRef.current?.dismiss({ overshootClamping: true });
    inboxFiltersSheetRef.current?.dismiss({ overshootClamping: true });
  };

  return (
    <Pressable onPress={handleBackdropPress} style={style}>
      <Animated.View style={[tailwind.style('bg-blackA-A9'), style, animatedStyle]} />
    </Pressable>
  );
};
