import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { tailwind } from '@/theme';

type WideActionButtonProps = {
  label: string;
  fill: string;
  disabled?: boolean;
  onPress: () => void;
  children: React.ReactNode;
};

// A full-width coloured button with a glyph and a label, the shape a phone's ring screen uses
export const WideActionButton = ({
  label,
  fill,
  disabled,
  onPress,
  children,
}: WideActionButtonProps) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={label}
    accessibilityState={{ disabled: !!disabled }}
    disabled={disabled}
    onPress={onPress}
    style={({ pressed }) => [
      tailwind.style('flex-1 h-11 rounded-xl flex-row items-center justify-center gap-2'),
      { backgroundColor: fill },
      disabled || pressed ? tailwind.style('opacity-60') : null,
    ]}>
    <View style={tailwind.style('h-[18px] w-[18px]')}>{children}</View>
    <Text style={tailwind.style('font-inter-580-24 text-[15px] leading-5 text-white')}>
      {label}
    </Text>
  </Pressable>
);
