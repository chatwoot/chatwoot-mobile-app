import React from 'react';
import Animated from 'react-native-reanimated';

import { TAB_BAR_HEIGHT } from '@/constants';
import { EmptyStateIcon } from '@/svg-icons/common';
import { tailwind } from '@/theme';
import i18n from '@/i18n';

export const InboxEmpty = () => {
  return (
    <Animated.View
      style={tailwind.style('flex-1 items-center justify-center', `pb-[${TAB_BAR_HEIGHT}px]`)}>
      <EmptyStateIcon />
      <Animated.Text
        style={tailwind.style('pt-6 text-md font-inter-420-20 tracking-[0.32px] text-gray-800')}>
        {i18n.t('NOTIFICATION.EMPTY')}
      </Animated.Text>
    </Animated.View>
  );
};
