import React from 'react';
import Animated from 'react-native-reanimated';
import i18n from 'i18n';

import { tailwind } from '@/theme';

export const SettingsHeader = () => {
  return (
    <Animated.View>
      <Animated.View style={tailwind.style('flex flex-row px-4 pt-2 pb-[12px]')}>
        <Animated.View style={tailwind.style('flex-1 justify-center items-center')}>
          <Animated.Text
            style={tailwind.style(
              'text-[17px] font-inter-medium-24 leading-[17px] tracking-[0.32px] text-center text-gray-950',
            )}>
            {i18n.t('SETTINGS.HEADER_TITLE')}
          </Animated.Text>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
};
