import React from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

import { tailwind } from '@/theme';

export const KEY_SIZE = 76;
export const KEYPAD_WIDTH = KEY_SIZE * 3 + 16 * 2;

type DialKeyProps = {
  value: string;
  onPress: (value: string) => void;
};

export const DialKey = ({ value, onPress }: DialKeyProps) => (
  <Pressable
    onPress={() => onPress(value)}
    style={({ pressed }) =>
      tailwind.style(
        `h-[${KEY_SIZE}px] w-[${KEY_SIZE}px] rounded-full bg-gray-50 items-center justify-center`,
        pressed ? 'bg-gray-100' : '',
      )
    }>
    <Animated.Text style={tailwind.style('text-[28px] font-inter-420-20 text-gray-950')}>
      {value}
    </Animated.Text>
  </Pressable>
);
