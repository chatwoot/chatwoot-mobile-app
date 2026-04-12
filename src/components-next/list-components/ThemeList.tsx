import React from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

import { TickIcon } from '@/svg-icons';
import { tailwind, useThemedStyles } from '@/theme';
import { useHaptic } from '@/utils';
import { Icon } from '@/components-next/common';
import { Theme } from '@/types';
import i18n from '@/i18n';

export type ThemeItemType = {
  title: string;
  key: Theme;
  description: string;
};

type ThemeCellProps = {
  item: ThemeItemType;
  index: number;
  totalItems: number;
  currentTheme: Theme;
  onChangeTheme: (theme: Theme) => void;
};

const ThemeCell = (props: ThemeCellProps) => {
  const { item, index, currentTheme, onChangeTheme, totalItems } = props;
  const styles = useThemedStyles();
  const hapticSelection = useHaptic();
  const handlePress = () => {
    hapticSelection?.();
    onChangeTheme(item.key);
  };

  const isLastItem = index === totalItems - 1;
  const isSelected = currentTheme === item.key;

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={tailwind.style('flex flex-row items-center')}>
        <Animated.View
          style={[
            tailwind.style('flex-1 ml-3 flex-row justify-between py-3 pr-3'),
            !isLastItem && { borderBottomWidth: 1, borderBottomColor: styles.colors.border },
          ]}
        >
          <Animated.View style={tailwind.style('flex-1')}>
            <Animated.Text
              style={[
                tailwind.style(
                  'text-base capitalize font-inter-420-20 leading-[21px] tracking-[0.16px]',
                ),
                styles.textPrimary,
              ]}
            >
              {item.title}
            </Animated.Text>
            <Animated.Text
              style={[
                tailwind.style(
                  'text-sm font-inter-normal-20 leading-[16px] tracking-[0.14px] mt-0.5',
                ),
                styles.textSecondary,
              ]}
            >
              {item.description}
            </Animated.Text>
          </Animated.View>
          {isSelected && <Icon icon={<TickIcon />} size={20} />}
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

export const ThemeList = ({
  currentTheme,
  onChangeTheme,
}: {
  currentTheme: Theme;
  onChangeTheme: (theme: Theme) => void;
}) => {
  const themesList: ThemeItemType[] = [
    {
      title: i18n.t('SETTINGS.THEME_SYSTEM'),
      key: 'system',
      description: i18n.t('SETTINGS.THEME_SYSTEM_DESCRIPTION'),
    },
    {
      title: i18n.t('SETTINGS.THEME_LIGHT'),
      key: 'light',
      description: i18n.t('SETTINGS.THEME_LIGHT_DESCRIPTION'),
    },
    {
      title: i18n.t('SETTINGS.THEME_DARK'),
      key: 'dark',
      description: i18n.t('SETTINGS.THEME_DARK_DESCRIPTION'),
    },
  ];

  return (
    <Animated.View style={tailwind.style('pt-1 pb-4 pl-2')}>
      {themesList.map((item, index) => {
        return (
          <ThemeCell
            key={item.key}
            {...{ item, index, currentTheme, onChangeTheme }}
            totalItems={themesList.length}
          />
        );
      })}
    </Animated.View>
  );
};
