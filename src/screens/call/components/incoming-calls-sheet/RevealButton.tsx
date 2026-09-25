import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { type AnimatedStyle } from 'react-native-reanimated';
import type { StyleProp, ViewStyle } from 'react-native';

import { tailwind } from '@/theme';

type RevealButtonProps = {
  side: 'left' | 'right';
  label: string;
  style: AnimatedStyle<StyleProp<ViewStyle>>;
  onPress: () => void;
  children: React.ReactNode;
};

// The answer or decline button a swiped card uncovers, scaling out from its own edge
export const RevealButton = ({ side, label, style, onPress, children }: RevealButtonProps) => (
  <View
    style={tailwind.style(
      'absolute top-0 bottom-0 justify-center',
      side === 'left' ? 'left-1.5' : 'right-1.5',
    )}>
    <Animated.View
      style={[
        tailwind.style('h-14 w-14 rounded-2xl'),
        side === 'left' ? styles.fromLeft : styles.fromRight,
        style,
      ]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onPress}
        style={tailwind.style('flex-1 items-center justify-center')}>
        {children}
      </Pressable>
    </Animated.View>
  </View>
);

// The scale origin, which Tailwind cannot express
const styles = StyleSheet.create({
  fromLeft: { transformOrigin: 'left center' },
  fromRight: { transformOrigin: 'right center' },
});
