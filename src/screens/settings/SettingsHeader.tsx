import React from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

import i18n from 'i18n';
import { Icon } from '@/components-next/common';
import { ChevronLeft } from '@/svg-icons';
import { tailwind } from '@/theme';

export const SettingsHeader = ({ onBackPress }: { onBackPress?: () => void }) => {
  return (
    <Animated.View>
      <Animated.View style={tailwind.style('flex flex-row items-center px-4 pt-2 pb-[12px]')}>
        {onBackPress ? (
          <Pressable
            accessibilityRole="button"
            hitSlop={16}
            onPress={onBackPress}
            style={tailwind.style('w-12 items-start')}>
            <Icon icon={<ChevronLeft stroke={tailwind.color('text-gray-700')} />} size={26} />
          </Pressable>
        ) : (
          <Animated.View style={tailwind.style('w-12')} />
        )}
        <Animated.View style={tailwind.style('flex-1 min-w-0 justify-center items-center px-3')}>
          <Animated.Text
            numberOfLines={1}
            style={tailwind.style('text-[17px] font-medium  text-center text-gray-950')}>
            {i18n.t('SETTINGS.HEADER_TITLE')}
          </Animated.Text>
        </Animated.View>
        <Animated.View style={tailwind.style('w-12')} />
      </Animated.View>
    </Animated.View>
  );
};
