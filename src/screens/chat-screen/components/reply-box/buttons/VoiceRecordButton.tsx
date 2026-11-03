import React from 'react';
import Animated from 'react-native-reanimated';
import { Pressable } from 'react-native';
import { Icon } from '@/components-next/common';
import { VoiceNote } from '@/svg-icons';
import { useScaleAnimation } from '@/utils';
import { tailwind } from '@/theme';
import { VoiceRecordButtonProps } from '../types';
import { ReplyGlassCircle } from './ReplyGlassCircle';
import { voiceNoteIconEnterAnimation, voiceNoteIconExitAnimation } from '@/utils/customAnimations';

export const VoiceRecordButton = ({ glass = false, ...props }: VoiceRecordButtonProps) => {
  const { animatedStyle, handlers } = useScaleAnimation();

  return (
    <Pressable {...props} {...handlers}>
      <Animated.View
        // The glass variant stays mounted under the send button (ReplySendOrMicButton).
        entering={glass ? undefined : voiceNoteIconEnterAnimation}
        exiting={glass ? undefined : voiceNoteIconExitAnimation}
        style={[
          tailwind.style(glass ? '' : 'flex items-center justify-center h-10 w-10 rounded-2xl'),
          animatedStyle,
        ]}>
        {glass ? (
          <ReplyGlassCircle>
            <Icon icon={<VoiceNote />} size={22} />
          </ReplyGlassCircle>
        ) : (
          <Icon icon={<VoiceNote />} size={24} />
        )}
      </Animated.View>
    </Pressable>
  );
};
