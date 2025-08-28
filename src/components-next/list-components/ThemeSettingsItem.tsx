import React from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

import { ThemeIcon } from '@/svg-icons/common';
import { tailwind } from '@/theme';
import { Icon } from '@/components-next/common/icon';
import { ThemeToggle } from '@/components-next/common/ThemeToggle';
import { useTheme } from '@/context/ThemeContext';
import i18n from 'i18n';

interface ThemeSettingsItemProps {
  isLastItem?: boolean;
}

export const ThemeSettingsItem: React.FC<ThemeSettingsItemProps> = ({ isLastItem = false }) => {
  const { theme } = useTheme();
  
  const getThemeLabel = () => {
    switch (theme) {
      case 'light':
        return i18n.t('SETTINGS.THEME_LIGHT');
      case 'dark':
        return i18n.t('SETTINGS.THEME_DARK');
      case 'system':
        return i18n.t('SETTINGS.THEME_SYSTEM');
      default:
        return i18n.t('SETTINGS.THEME_SYSTEM');
    }
  };

  return (
    <Animated.View style={tailwind.style('flex flex-row items-center pl-3')}>
      <Animated.View>
        <Icon icon={<ThemeIcon />} size={24} />
      </Animated.View>
      <Animated.View
        style={tailwind.style(
          'flex-1 flex-row items-center justify-between py-[11px] ml-3',
          !isLastItem ? 'border-b-[1px] border-b-blackA-A3' : '',
        )}>
        <Animated.View style={tailwind.style('flex-1')}>
          <Animated.Text
            style={tailwind.style(
              'text-base font-inter-420-20 leading-[22px] tracking-[0.16px] text-gray-950',
            )}>
            {i18n.t('SETTINGS.THEME')}
          </Animated.Text>
          <Animated.Text
            style={tailwind.style(
              'text-sm font-inter-normal-20 leading-[18px] tracking-[0.14px] text-gray-700 mt-1',
            )}>
            {getThemeLabel()}
          </Animated.Text>
        </Animated.View>
        <Animated.View style={tailwind.style('pr-3 ml-3')}>
          <ThemeToggle />
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
};
