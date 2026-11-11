import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { useTailwind } from '@/theme/useTailwind';

import { CALL_GLASS, CallSurface } from './CallSurface';

import { useCallTheme } from '../constants/callTheme';

export type CallControlTone = 'on' | 'off' | 'hold' | 'end';

type CallControlProps = {
  label: string;
  tone: CallControlTone;
  inactive?: boolean;
  disabled?: boolean;
  onPress: () => void;
  children: React.ReactNode;
};

export const CallControl = ({
  label,
  tone,
  inactive,
  disabled,
  onPress,
  children,
}: CallControlProps) => {
  const tailwind = useTailwind();
  const {
    CALL_END,
    CALL_LABEL_TEXT,
    CONTROL_DISABLED_BORDER,
    CONTROL_DISABLED_LABEL,
    CONTROL_HOLD_FILL,
    CONTROL_OFF_FILL,
    CONTROL_ON_FILL,
  } = useCallTheme();
  const CONTROL_FILL: Record<CallControlTone, string> = {
    on: CONTROL_ON_FILL,
    off: CONTROL_OFF_FILL,
    hold: CONTROL_HOLD_FILL,
    end: CALL_END,
  };
  return (
    <View style={tailwind.style('w-[60px] items-center gap-2')}>
      {CALL_GLASS ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={label}
          accessibilityState={{ disabled: !!disabled || !!inactive, selected: tone === 'on' }}
          disabled={disabled || inactive}
          onPress={onPress}
          style={inactive || disabled ? tailwind.style('opacity-50') : null}>
          <CallSurface
            radius={18}
            shadow={{}}
            interactive
            style={tailwind.style('h-[60px] w-[60px] items-center justify-center')}>
            <View style={tailwind.style('h-[26px] w-[26px] items-center justify-center')}>
              {children}
            </View>
          </CallSurface>
        </Pressable>
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={label}
          accessibilityState={{ disabled: !!disabled || !!inactive, selected: tone === 'on' }}
          disabled={disabled || inactive}
          onPress={onPress}
          style={({ pressed }) => [
            tailwind.style('h-[60px] w-[60px] rounded-[18px] items-center justify-center'),
            inactive
              ? { borderWidth: 1.5, borderColor: CONTROL_DISABLED_BORDER }
              : { backgroundColor: CONTROL_FILL[tone] },
            pressed && !inactive ? tailwind.style('opacity-70') : null,
          ]}>
          <View style={tailwind.style('h-[26px] w-[26px] items-center justify-center')}>
            {children}
          </View>
        </Pressable>
      )}
      <Text
        numberOfLines={1}
        style={[
          tailwind.style('font-inter-420-20 text-[13px] leading-4 max-w-[68px]'),
          { color: inactive ? CONTROL_DISABLED_LABEL : CALL_LABEL_TEXT },
        ]}>
        {label}
      </Text>
    </View>
  );
};
