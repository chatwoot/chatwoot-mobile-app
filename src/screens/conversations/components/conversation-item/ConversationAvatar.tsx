import React, { memo } from 'react';
import { ImageURISource } from 'react-native';
import { LinearTransition } from 'react-native-reanimated';
import { isEqual } from 'lodash';

import { Avatar, AvatarStatusType } from '@/components-next/common';
import { AnimatedNativeView } from '@/components-next/native-components';
import { tailwind } from '@/theme';
import { AvailabilityStatus } from '@/types';

type ConversationAvatarProps = {
  src: ImageURISource;
  name: string;
  status: AvailabilityStatus;
  unreadCount?: number;
};

const checkIfPropsAreSame = (prev: ConversationAvatarProps, next: ConversationAvatarProps) => {
  const arePropsEqual = isEqual(prev, next);
  return arePropsEqual;
};

// eslint-disable-next-line react/display-name
export const ConversationAvatar = memo((props: ConversationAvatarProps) => {
  const { src, name, status, unreadCount } = props;
  return (
    <AnimatedNativeView
      style={tailwind.style('')}
      layout={LinearTransition.springify().damping(28).stiffness(200)}>
      <Avatar 
        size="5xl" 
        src={src}
        name={name}
        status={status as AvatarStatusType}
        counter={unreadCount && unreadCount > 0 ? { count: unreadCount } : undefined}
      />
    </AnimatedNativeView>
  );
}, checkIfPropsAreSame);
