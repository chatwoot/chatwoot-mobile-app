import React from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import i18n from '@/i18n';
import { tailwind } from '@/theme';
import { useTabBarHeight } from '@/utils/common';
import { Spinner } from '../spinner';

import { SNACKBAR_SURFACE } from './constants';

/**
 * Indeterminate "Downloading update…" pill floating 8dp above the tab bar. It is not
 * interactive, so touches pass through to the list underneath.
 */
export const DownloadingPill = () => {
  const tabBarHeight = useTabBarHeight();

  return (
    <Animated.View
      entering={FadeIn}
      exiting={FadeOut}
      pointerEvents="none"
      style={[
        tailwind.style('absolute left-4 right-4 items-center'),
        { bottom: tabBarHeight + 8 },
      ]}>
      <View
        accessibilityRole="text"
        accessibilityLiveRegion="polite"
        style={[
          tailwind.style('min-h-[40px] flex-row items-center gap-2.5 rounded-[20px] py-2.5'),
          {
            paddingStart: 14,
            paddingEnd: 16,
            backgroundColor: SNACKBAR_SURFACE,
            shadowColor: '#000',
            shadowOpacity: 0.24,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 3 },
            elevation: 6,
          },
        ]}>
        <Spinner size={16} stroke={tailwind.color('text-blue-600')} />
        <Text style={tailwind.style('text-sm leading-5 font-inter-medium-24 text-white')}>
          {i18n.t('APP_UPDATE.DOWNLOADING')}
        </Text>
      </View>
    </Animated.View>
  );
};
