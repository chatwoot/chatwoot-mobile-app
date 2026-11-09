import React from 'react';
import Animated from 'react-native-reanimated';

import i18n from 'i18n';
import { tailwind } from '@/theme';
import { IOS_DESIGN, useSideTabBarLayout } from '@/utils';

export const SettingsHeader = () => {
  const sideTabBar = useSideTabBarLayout();

  if (sideTabBar || IOS_DESIGN) {
    return (
      <Animated.View style={{ paddingTop: sideTabBar?.contentTopPadding ?? 0 }}>
        <Animated.View style={tailwind.style('flex flex-row items-center px-4 pt-1 pb-3')}>
          <Animated.View style={tailwind.style('w-24 h-9')} />
          <Animated.Text
            numberOfLines={1}
            accessibilityRole="header"
            style={tailwind.style(
              'flex-1 text-[17px] text-center leading-[22px] tracking-[0.32px] font-inter-medium-24 text-gray-950',
            )}>
            {i18n.t('SETTINGS.HEADER_TITLE')}
          </Animated.Text>
          <Animated.View style={tailwind.style('w-24 h-9')} />
        </Animated.View>
      </Animated.View>
    );
  }

  return (
    <Animated.View>
      <Animated.View style={tailwind.style('flex flex-row px-4 pt-2 pb-[12px]')}>
        <Animated.View style={tailwind.style('flex-1 justify-center items-center')}>
          <Animated.Text
            style={tailwind.style('text-[17px] font-medium  text-center text-gray-950')}>
            {i18n.t('SETTINGS.HEADER_TITLE')}
          </Animated.Text>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
};
