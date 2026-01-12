import React from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

import { TickIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import { useHaptic } from '@/utils';
import { Icon } from '@/components-next/common';
import { Theme } from '@/types/common/Theme';
import i18n from '@/i18n';

export type ThemeItemType = {
  key: Theme;
};

type ThemeCellProps = {
  item: ThemeItemType;
  index: number;
  currentTheme: Theme;
  onChangeTheme: (theme: Theme) => void;
  totalItems: number;
};

const themesList: ThemeItemType[] = [
  { key: 'light' },
  { key: 'dark' },
  { key: 'system' },
];

const ThemeCell = (props: ThemeCellProps) => {
  const { item, index, currentTheme, onChangeTheme, totalItems } = props;
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
          style={tailwind.style(
            'flex-1 ml-3 flex-row justify-between py-[11px] pr-3',
            !isLastItem && 'border-b-[1px] border-blackA-A3',
          )}>
          <Animated.Text
            style={tailwind.style(
              'text-base capitalize text-gray-950 font-inter-420-20 leading-[21px] tracking-[0.16px]',
            )}>
            {i18n.t(`SETTINGS.THEME_${item.key.toUpperCase()}`)}
          </Animated.Text>
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
  return (
    <Animated.View style={tailwind.style('pt-1 pb-4 pl-2')}>
      {themesList.map((item, index) => {
        return (
          <ThemeCell 
            key={index} 
            item={item}
            index={index}
            currentTheme={currentTheme}
            onChangeTheme={onChangeTheme}
            totalItems={themesList.length}
          />
        );
      })}
    </Animated.View>
  );
};

export const ThemeSelector = ThemeList;

export default ThemeList;
