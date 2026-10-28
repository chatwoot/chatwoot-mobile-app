import { useTailwind } from '@/theme/useTailwind';
import React, { useCallback } from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

import { ThemeTailwind } from '@/theme/useTailwind';
import { useHaptic, useScaleAnimation } from '@/utils';
import { Icon } from '../common';
import { PhoneIcon } from '@/svg-icons';

type ButtonProps = {
  isDestructive?: boolean;
  text: string;
  handlePress?: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
};

const getButtonStyles = (
  tailwind: ThemeTailwind,
  isPrimary: boolean,
  pressed: boolean,
  disabled: boolean,
  secondaryBackground?: string,
) => {
  const baseStyles = 'py-[11px] flex-row items-center justify-center rounded-[13px] gap-4';
  const variantStyles = isPrimary ? 'bg-blue-800' : (secondaryBackground ?? 'bg-gray-50');
  const pressedStyles = isPrimary ? 'opacity-95' : pressed ? 'bg-gray-100' : '';

  return tailwind.style(baseStyles, variantStyles, pressedStyles, disabled ? 'opacity-40' : '');
};

const getTextStyles = (tailwind: ThemeTailwind, isPrimary: boolean, isDestructive: boolean) => {
  const baseStyles = 'text-base font-medium tracking-[0.16px] leading-[22px]';
  const colorStyles = isPrimary
    ? isDestructive
      ? 'text-tomato-800'
      : 'text-blue-800'
    : isDestructive
      ? 'text-ruby-800'
      : 'text-blue-800';

  return tailwind.style(baseStyles, colorStyles);
};

export const IconButton = ({
  text,
  isDestructive = false,
  handlePress,
  variant = 'primary',
  disabled = false,
  icon,
  secondaryBackground,
}: ButtonProps & {
  icon?: React.ReactElement;
  // Background for the secondary variant, e.g. white on a gray page.
  secondaryBackground?: string;
}) => {
  const tailwind = useTailwind();
  const { handlers, animatedStyle } = useScaleAnimation();
  const haptic = useHaptic(isDestructive ? 'medium' : 'selection');

  const handleButtonPress = useCallback(() => {
    if (!disabled) {
      haptic?.();
      handlePress?.();
    }
  }, [disabled, handlePress, haptic]);

  const isPrimary = variant === 'primary';

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={handleButtonPress}
        disabled={disabled}
        accessible
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        style={({ pressed }) =>
          getButtonStyles(tailwind, isPrimary, pressed, disabled, secondaryBackground)
        }
        {...handlers}>
        {/* Defaults to the phone icon (its original use, Call); pass one for other actions. */}
        <Icon
          icon={icon ?? <PhoneIcon strokeWidth={2} stroke={tailwind.color('bg-blue-800')} />}
          size={24}
        />
        <Animated.Text style={getTextStyles(tailwind, isPrimary, isDestructive)}>
          {text}
        </Animated.Text>
      </Pressable>
    </Animated.View>
  );
};
