import React from 'react';
import { Pressable, Text } from 'react-native';
import Animated, { type AnimatedStyle } from 'react-native-reanimated';
import type { StyleProp, ViewStyle } from 'react-native';

import { tailwind } from '@/theme';

type RevealPanelProps = {
  side: 'left' | 'right';
  label: string;
  colour: string;
  // Grows with the drag, so the panel is always as wide as the space the row uncovered
  style: AnimatedStyle<StyleProp<ViewStyle>>;
  onPress: () => void;
  children: React.ReactNode;
};

// The full-height answer or decline panel a swiped row uncovers, its content centred and
// clipped to the uncovered width
export const RevealPanel = ({
  side,
  label,
  colour,
  style,
  onPress,
  children,
}: RevealPanelProps) => (
  <Animated.View
    style={[
      tailwind.style(
        'absolute top-0 bottom-0 overflow-hidden',
        side === 'left' ? 'left-0' : 'right-0',
      ),
      { backgroundColor: colour },
      style,
    ]}>
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={tailwind.style('flex-1 items-center justify-center gap-1')}>
      {children}
      <Text
        numberOfLines={1}
        style={tailwind.style('font-inter-580-24 text-[13px] leading-4 text-white')}>
        {label}
      </Text>
    </Pressable>
  </Animated.View>
);
