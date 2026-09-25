import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { tailwind } from '@/theme';

import { CALL_END, CALL_HOLD, CALL_LIVE, SOLID_CONTROL_OFF } from '../constants/callTheme';
import { GlassSurface } from './GlassSurface';

export type CallControlTone = 'on' | 'off' | 'hold' | 'end';

const CONTROL_FILL: Record<Exclude<CallControlTone, 'off'>, string> = {
  on: CALL_LIVE,
  hold: CALL_HOLD,
  end: CALL_END,
};

type CallControlProps = {
  label: string;
  // What is live is green, what is off is grey; hold and end keep their own colours
  tone: CallControlTone;
  // A control that does nothing yet stays in place, faded, so the row keeps its shape
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
  <View
    style={[
      tailwind.style('w-[68px] items-center gap-2'),
      inactive ? tailwind.style('opacity-[0.45]') : null,
    ]}>
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled || !!inactive, selected: tone === 'on' }}
      disabled={disabled || inactive}
      onPress={onPress}
      style={({ pressed }) => (pressed ? tailwind.style('opacity-70') : null)}>
      <GlassSurface
        interactive
        tint={tone === 'off' ? undefined : CONTROL_FILL[tone]}
        style={tailwind.style('h-[60px] w-[60px] rounded-[18px] items-center justify-center')}
        fallbackStyle={{
          backgroundColor: tone === 'off' ? SOLID_CONTROL_OFF : CONTROL_FILL[tone],
        }}>
        <View style={tailwind.style('h-[26px] w-[26px] items-center justify-center')}>
          {children}
        </View>
      </GlassSurface>
    </Pressable>
    <Text
      numberOfLines={1}
      style={tailwind.style('font-inter-420-20 text-[13px] leading-4 text-gray-900 max-w-[68px]')}>
      {label}
    </Text>
  </View>
);
