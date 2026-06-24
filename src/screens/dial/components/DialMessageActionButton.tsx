import React from 'react';
import { Pressable } from 'react-native';

import { Icon } from '@/components-next';
import { ChatwootIcon } from '@/svg-icons';
import { tailwind } from '@/theme';

const ACTION_BUTTON_SIZE = 64;
const ACTION_ICON_SIZE = 26;

type DialMessageActionButtonProps = {
  disabled: boolean;
  onPress: () => void;
};

export const DialMessageActionButton = ({ disabled, onPress }: DialMessageActionButtonProps) => (
  <Pressable
    disabled={disabled}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityState={{ disabled }}
    style={({ pressed }) =>
      tailwind.style(
        `h-[${ACTION_BUTTON_SIZE}px] w-[${ACTION_BUTTON_SIZE}px] rounded-full items-center justify-center`,
        disabled ? 'bg-gray-200' : 'bg-blue-800',
        pressed && !disabled ? 'bg-blue-900' : '',
      )
    }>
    <Icon
      icon={
        <ChatwootIcon
          strokeWidth={2}
          stroke={tailwind.color(disabled ? 'text-gray-700' : 'bg-white')}
        />
      }
      size={ACTION_ICON_SIZE}
    />
  </Pressable>
);
