import React from 'react';
import { Pressable } from 'react-native';

import { Icon } from '@/components-next';
import { PhoneIcon } from '@/svg-icons';
import { tailwind } from '@/theme';

type CallActionButtonProps = {
  disabled?: boolean;
  onPress: () => void;
  type: 'accept' | 'end';
};

const BUTTON_SIZE = 64;
const ICON_SIZE = 26;

const getButtonColor = (type: CallActionButtonProps['type'], disabled?: boolean) => {
  if (disabled) {
    return 'bg-gray-200';
  }

  return type === 'end' ? 'bg-ruby-900' : 'bg-teal-900';
};

const getPressedColor = (type: CallActionButtonProps['type']) => {
  return type === 'end' ? 'bg-ruby-950' : 'bg-teal-950';
};

export const CallActionButton = ({ disabled = false, onPress, type }: CallActionButtonProps) => {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) =>
        tailwind.style(
          `h-[${BUTTON_SIZE}px] w-[${BUTTON_SIZE}px] rounded-full items-center justify-center`,
          getButtonColor(type, disabled),
          pressed && !disabled ? getPressedColor(type) : '',
        )
      }>
      <Icon
        icon={
          <PhoneIcon
            strokeWidth={2}
            stroke={tailwind.color(disabled ? 'bg-gray-700' : 'bg-white')}
          />
        }
        size={ICON_SIZE}
        style={type === 'end' ? tailwind.style('rotate-[135deg]') : undefined}
      />
    </Pressable>
  );
};
