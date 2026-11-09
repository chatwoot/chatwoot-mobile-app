import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { useTailwind } from '@/theme/useTailwind';

import { CALL_GLASS, CallSurface } from './CallSurface';

type WideActionButtonProps = {
  label: string;
  fill: string;
  labelColor?: string;
  disabled?: boolean;
  onPress: () => void;
  children: React.ReactNode;
};

export const WideActionButton = ({
  label,
  fill,
  labelColor = '#FFFFFF',
  disabled,
  onPress,
  children,
}: WideActionButtonProps) => {
  const tailwind = useTailwind();
  return CALL_GLASS ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[tailwind.style('flex-1'), disabled ? tailwind.style('opacity-60') : null]}>
      <CallSurface
        radius={12}
        shadow={{}}
        interactive
        style={tailwind.style('h-11 flex-row items-center justify-center gap-2')}>
        <View style={tailwind.style('h-[18px] w-[18px]')}>{children}</View>
        <Text style={[tailwind.style('font-inter-580-24 text-[15px] leading-5'), { color: fill }]}>
          {label}
        </Text>
      </CallSurface>
    </Pressable>
  ) : (
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
      <Text
        style={[tailwind.style('font-inter-580-24 text-[15px] leading-5'), { color: labelColor }]}>
        {label}
      </Text>
    </Pressable>
  );
};
