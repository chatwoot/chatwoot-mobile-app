import React, { memo } from 'react';
import { ImageURISource } from 'react-native';
import { LinearTransition } from 'react-native-reanimated';
import { isEqual } from 'lodash';

import { Avatar } from '@/components-next/common';
import { AnimatedNativeView } from '@/components-next/native-components';
import { tailwind } from '@/theme';
import { Channel } from '../../../../types';

type ConversationAvatarProps = {
  src: ImageURISource;
  name: string;
  channel: Channel;
};

const checkIfPropsAreSame = (prev: any, next: any) => {
  const arePropsEqual = isEqual(prev, next);
  return arePropsEqual;
};

// eslint-disable-next-line react/display-name
export const ConversationAvatar = memo((props: ConversationAvatarProps) => {
  const { src, name, channel } = props;

  return (
    <AnimatedNativeView
      style={tailwind.style('pt-3')}
      layout={LinearTransition.springify().damping(28).stiffness(200)}>
      <Avatar size="4xl" {...{ src, name, channel }} />
    </AnimatedNativeView>
  );
}, checkIfPropsAreSame);
