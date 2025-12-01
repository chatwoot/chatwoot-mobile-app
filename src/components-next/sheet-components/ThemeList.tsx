import React from 'react';
import { Pressable, Text, Animated } from 'react-native';

import { TickIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import { Theme } from '@/types/common/Theme';
import { useHaptic } from '@/utils';
import { Icon } from '@/components-next/common/icon';
import i18n from '@/i18n';

type ThemeListItemType = {
  value: Theme;
  label: string;
  description: string;
};

const THEME_OPTIONS: ThemeListItemType[] = [
  {
    value: 'light',
    label: i18n.t('SETTINGS.THEME.LIGHT'),
    description: i18n.t('SETTINGS.THEME.LIGHT_DESCRIPTION'),
  },
  {
    value: 'dark',
    label: i18n.t('SETTINGS.THEME.DARK'),
    description: i18n.t('SETTINGS.THEME.DARK_DESCRIPTION'),
  },
  {
    value: 'system',
    label: i18n.t('SETTINGS.THEME.SYSTEM'),
    description: i18n.t('SETTINGS.THEME.SYSTEM_DESCRIPTION'),
  },
];

type ThemeCellProps = {
  item: ThemeListItemType;
  index: number;
  currentTheme: Theme;
  changeTheme: (theme: Theme) => void;
};

const ThemeCell = ({ item, index, currentTheme, changeTheme }: ThemeCellProps) => {
  const hapticSelection = useHaptic();

  const handlePress = () => {
    hapticSelection?.();
    changeTheme(item.value);
  };

  const isLastItem = index === THEME_OPTIONS.length - 1;
  const isSelected = currentTheme === item.value;

  return (
    <Pressable onPress={handlePress}>
      <Animated.View
        style={tailwind.style(
          'flex flex-row items-center justify-between py-3 px-4',
          !isLastItem && 'border-b-[1px] border-blackA-A3',
        )}>
        <Animated.View style={tailwind.style('flex-1 flex-col')}>
          <Text
            style={tailwind.style(
              'text-base text-gray-950 font-inter-420-20 leading-[21px] tracking-[0.16px]',
            )}>
            {item.label}
          </Text>
          <Text style={tailwind.style('text-sm text-gray-700 font-inter-normal-20 mt-0.5')}>
            {item.description}
          </Text>
        </Animated.View>
        {isSelected && (
          <Animated.View style={tailwind.style('ml-3')}>
            <Icon icon={<TickIcon />} size={20} />
          </Animated.View>
        )}
      </Animated.View>
    </Pressable>
  );
};

export const ThemeList = ({
  currentTheme,
  changeTheme,
}: {
  currentTheme: Theme;
  changeTheme: (theme: Theme) => void;
}) => {
  return (
    <Animated.View style={tailwind.style('flex flex-col')}>
      {THEME_OPTIONS.map((item, index) => (
        <ThemeCell
          key={item.value}
          item={item}
          index={index}
          currentTheme={currentTheme}
          changeTheme={changeTheme}
        />
      ))}
    </Animated.View>
  );
};
