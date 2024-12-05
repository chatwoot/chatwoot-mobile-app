import React from 'react';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { Pressable } from 'react-native';
import { Icon } from '@/components-next/common';
import { SendIcon } from '@/svg-icons';
import { useScaleAnimation } from '@/utils';
import { tailwind } from '@/theme';
import { useAppSelector } from '@/hooks';
import { selectIsPrivateMessage } from '@/store/conversation/sendMessageSlice';
import { SendMessageButtonProps } from '../types';
import { sendIconEnterAnimation, sendIconExitAnimation } from '@/utils/customAnimations';

export const SendMessageButton = (props: SendMessageButtonProps) => {
  const { animatedStyle, handlers } = useScaleAnimation();
  const isPrivateMessage = useAppSelector(selectIsPrivateMessage);

  return (
    <Pressable {...props} {...handlers}>
      <Animated.View
        layout={LinearTransition.springify().damping(20).stiffness(180)}
        entering={sendIconEnterAnimation}
        exiting={sendIconExitAnimation}
        style={[tailwind.style('flex items-center justify-center h-10 w-10'), animatedStyle]}>
        <Animated.View
          style={tailwind.style(
            'flex items-center justify-center h-7 w-7 rounded-full bg-gray-950',
            isPrivateMessage ? 'bg-amber-700' : 'bg-gray-950',
          )}>
          <Icon icon={<SendIcon />} size={16} />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};
