import { useTailwind } from '@/theme/useTailwind';
/* eslint-disable react/display-name */
import React, { memo } from 'react';
import { LinearTransition } from 'react-native-reanimated';

import { Icon } from '@/components-next/common';
import { AnimatedNativeView } from '@/components-next/native-components';
import { CheckedIcon, UncheckedIcon } from '@/svg-icons';

type ConversationSelectProps = {
  isSelected: boolean;
  currentState: string;
};

export const ConversationSelect = memo((props: ConversationSelectProps) => {
  const tailwind = useTailwind();
  const { isSelected, currentState } = props;

  return currentState === 'Select' ? (
    <AnimatedNativeView
      layout={LinearTransition.springify().mass(1).damping(21).stiffness(115)}
      style={tailwind.style('h-full pt-[23px] pr-3')}>
      <Icon icon={isSelected ? <CheckedIcon /> : <UncheckedIcon />} size={20} />
    </AnimatedNativeView>
  ) : null;
});
