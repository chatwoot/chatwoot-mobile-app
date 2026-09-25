import React from 'react';
import { Text } from 'react-native';
import { Pressable } from 'react-native-gesture-handler';

import { tailwind } from '@/theme';
import { CallIcon } from '@/svg-icons';

type CallActionButtonProps = {
  label: string;
  onPress: () => void;
  disabled: boolean;
  lightOnDark: boolean;
};

// The one action a call bubble offers: joining a call still ringing, or calling back
export const CallActionButton = ({
  label,
  onPress,
  disabled,
  lightOnDark,
}: CallActionButtonProps) => {
  const foreground = tailwind.color(lightOnDark ? 'text-blue-800' : 'text-white') as string;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={tailwind.style(
        'self-start flex-row items-center gap-2 rounded-full px-4 py-2',
        lightOnDark ? 'bg-white' : 'bg-blue-800',
        disabled ? 'opacity-50' : '',
      )}>
      <CallIcon color={foreground} size={16} />
      <Text
        style={[
          tailwind.style('text-sm font-inter-medium-24 tracking-[0.32px]'),
          { color: foreground },
        ]}>
        {label}
      </Text>
    </Pressable>
  );
};
