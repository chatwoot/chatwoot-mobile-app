import React from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

import { tailwind } from '@/theme';
import { Icon } from '../common/icon/Icon';

type AuthButtonProps = {
  text: string;
  icon: React.ReactNode;
  handlePress?: () => void;
  disabled?: boolean;
  variant?: 'outline' | 'filled';
  style?: any;
};

export const AuthButton = ({
  text,
  icon,
  handlePress,
  disabled = false,
  variant = 'outline',
  style,
}: AuthButtonProps) => {
  const getButtonStyles = () => {
    const baseStyles = 'py-[11px] flex-row items-center justify-center rounded-[13px]';

    if (variant === 'filled') {
      const variantStyles = disabled ? 'bg-primary-disabled' : 'bg-primary';
      return tailwind.style(baseStyles, variantStyles);
    }

    // Outline variant
    const borderStyles = 'border border-secondary';
    const bgStyles = disabled ? 'bg-secondary-light' : 'bg-transparent';
    return tailwind.style(baseStyles, borderStyles, bgStyles);
  };

  const getTextStyles = () => {
    const baseStyles = 'ml-2 text-base font-medium';

    if (variant === 'filled') {
      const colorStyles = disabled ? 'text-oceanCoral' : 'text-white';
      return tailwind.style(baseStyles, colorStyles);
    }

    // Outline variant
    const colorStyles = disabled ? 'text-oceanCoral' : 'text-primary';
    return tailwind.style(baseStyles, colorStyles);
  };

  return (
    <Pressable style={[getButtonStyles(), style]} onPress={handlePress} disabled={disabled}>
      <Icon size={16} icon={icon} />
      <Animated.Text style={getTextStyles()}>{text}</Animated.Text>
    </Pressable>
  );
};
