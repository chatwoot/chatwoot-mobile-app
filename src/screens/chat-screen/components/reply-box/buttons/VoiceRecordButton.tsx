import React from 'react';
import Animated from 'react-native-reanimated';
import { Pressable } from 'react-native';
import { Icon } from '@/components-next/common';
import { VoiceNote } from '@/svg-icons';
import { useScaleAnimation } from '@/utils';
import { tailwind, useAppTheme } from '@/theme';
import { VoiceRecordButtonProps } from '../types';
import { voiceNoteIconEnterAnimation, voiceNoteIconExitAnimation } from '@/utils/customAnimations';

export const VoiceRecordButton = (props: VoiceRecordButtonProps) => {
  const { animatedStyle, handlers } = useScaleAnimation();
  const { isDark } = useAppTheme();
  const iconColor = tailwind.color(isDark ? 'text-grayDark-950' : 'text-black') as string;

  return (
    <Pressable {...props} {...handlers}>
      <Animated.View
        entering={voiceNoteIconEnterAnimation}
        exiting={voiceNoteIconExitAnimation}
        style={[
          tailwind.style('flex items-center justify-center h-10 w-10 rounded-2xl'),
          animatedStyle,
        ]}>
        <Icon
          icon={<VoiceNote stroke={iconColor} strokeOpacity={isDark ? 0.78 : 0.565} />}
          size={24}
        />
      </Animated.View>
    </Pressable>
  );
};
