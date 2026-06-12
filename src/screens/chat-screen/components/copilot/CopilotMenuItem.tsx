import React from 'react';
import { Pressable, Text } from 'react-native';
import Animated from 'react-native-reanimated';
import { Icon } from '@/components-next/common';
import { tailwind } from '@/theme';
import { useScaleAnimation, useHaptic } from '@/utils';

type CopilotMenuItemProps = {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
};

export const CopilotMenuItem = ({ icon, label, onPress }: CopilotMenuItemProps) => {
  const { animatedStyle, handlers } = useScaleAnimation();
  const hapticSelection = useHaptic();

  const handlePress = () => {
    hapticSelection?.();
    onPress();
  };

  return (
    <Animated.View style={[tailwind.style('mb-3'), animatedStyle]}>
      <Pressable onPress={handlePress} {...handlers}>
        <Animated.View style={tailwind.style('flex-row items-center justify-start gap-[18px]')}>
          <Animated.View
            style={tailwind.style('flex items-center justify-center h-10 w-10 rounded-2xl')}>
            <Icon icon={icon} size={20} />
          </Animated.View>
          <Text
            style={tailwind.style(
              'text-base font-inter-normal-20 leading-[18px] tracking-[0.24px] text-gray-950',
            )}>
            {label}
          </Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};
