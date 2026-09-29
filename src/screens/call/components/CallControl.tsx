import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { tailwind } from '@/theme';

import {
  CALL_END,
  CALL_LABEL_TEXT,
  CONTROL_DISABLED_BORDER,
  CONTROL_DISABLED_LABEL,
  CONTROL_HOLD_FILL,
  CONTROL_OFF_FILL,
  CONTROL_ON_FILL,
} from '../constants/callTheme';

export type CallControlTone = 'on' | 'off' | 'hold' | 'end';

const CONTROL_FILL: Record<CallControlTone, string> = {
  on: CONTROL_ON_FILL,
  off: CONTROL_OFF_FILL,
  hold: CONTROL_HOLD_FILL,
  end: CALL_END,
};

type CallControlProps = {
  label: string;
  // A toggle that is on is blue, one that is off is grey; hold and end keep their own colours
  tone: CallControlTone;
  // A control that does nothing yet keeps its place in the row as an empty outline
  inactive?: boolean;
  disabled?: boolean;
  onPress: () => void;
  children: React.ReactNode;
};

// One round-cornered button in the call tray with its label underneath
export const CallControl = ({
  label,
  tone,
  inactive,
  disabled,
  onPress,
  children,
}: CallControlProps) => (
  <View style={tailwind.style('w-[60px] items-center gap-2')}>
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
