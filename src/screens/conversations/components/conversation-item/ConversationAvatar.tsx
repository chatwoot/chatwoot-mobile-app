import React, { memo } from 'react';
import { ImageURISource } from 'react-native';
import { LinearTransition } from 'react-native-reanimated';
import { isEqual } from 'lodash';

import { Avatar, AvatarStatusType } from '@/components-next/common';
import { AnimatedNativeView } from '@/components-next/native-components';
import { tailwind } from '@/theme';
import { AvailabilityStatus } from '@/types';
import { useIOSListText } from '@/utils';

type ConversationAvatarProps = {
  src: ImageURISource;
  name: string;
  status: AvailabilityStatus;
};

const checkIfPropsAreSame = (prev: ConversationAvatarProps, next: ConversationAvatarProps) => {
  const arePropsEqual = isEqual(prev, next);
  return arePropsEqual;
};

export const ConversationAvatar = memo((props: ConversationAvatarProps) => {
  const { src, name, status } = props;
  // 40pt with 16pt initials (about 40% of the circle, like iOS monograms) on the iOS
  // list layout (iPhone Duo); 50pt elsewhere.
  const iosList = useIOSListText();
  const size = iosList ? '2xl' : '4xl';
  return (
    <AnimatedNativeView
      style={tailwind.style('')}
      layout={LinearTransition.springify().mass(1).damping(21).stiffness(115)}>
      <Avatar
        size={size}
        initialsClassName={iosList ? 'text-[16px]' : undefined}
        {...{ src, name, status: status as AvatarStatusType }}
      />
    </AnimatedNativeView>
  );
}, checkIfPropsAreSame);

ConversationAvatar.displayName = 'ConversationAvatar';
