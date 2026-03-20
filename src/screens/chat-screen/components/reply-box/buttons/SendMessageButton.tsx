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
  const { disabled, ...restProps } = props;
  const { animatedStyle, handlers } = useScaleAnimation();
  const isPrivateMessage = useAppSelector(selectIsPrivateMessage);

  const getBgColor = () => {
    if (disabled) return 'bg-gray-400';
    if (isPrivateMessage) return 'bg-amber-700';
    return 'bg-gray-950';
  };

  return (
    <Pressable {...restProps} disabled={disabled} {...(disabled ? {} : handlers)}>
      <Animated.View
        layout={LinearTransition.springify().damping(20).stiffness(180)}
        entering={sendIconEnterAnimation}
        exiting={sendIconExitAnimation}
        style={[tailwind.style('flex items-center justify-center h-10 w-10'), disabled ? {} : animatedStyle]}>
        <Animated.View
          style={tailwind.style(
            'flex items-center justify-center h-7 w-7 rounded-full',
            getBgColor(),
          )}>
          <Icon icon={<SendIcon />} size={16} />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};
