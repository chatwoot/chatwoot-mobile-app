import React from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

import { tailwind } from '@/theme';
import { Icon } from '@/components-next';

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
    const variantStyles = variant === 'filled' ? 'bg-blue-800' : 'bg-gray-50';
    const disabledStyles = disabled ? 'opacity-50' : '';
    
    return tailwind.style(baseStyles, variantStyles, disabledStyles);
  };

  const getTextStyles = () => {
    const baseStyles = 'ml-2 text-base font-medium';
    const colorStyles = variant === 'filled' ? 'text-white' : 'text-gray-950';
    
    return tailwind.style(baseStyles, colorStyles);
  };

  return (
    <Pressable
      style={[getButtonStyles(), style]}
      onPress={handlePress}
      disabled={disabled}
    >
      <Icon size={16} icon={icon} />
      <Animated.Text style={getTextStyles()}>
        {text}
      </Animated.Text>
    </Pressable>
  );
};