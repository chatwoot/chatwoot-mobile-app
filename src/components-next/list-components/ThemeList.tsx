import React from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

import { TickIcon } from '@/svg-icons';
import { tailwind, useThemedStyles } from '@/theme';
import { useHaptic } from '@/utils';
import { Icon } from '@/components-next/common';
import { Theme } from '@/types';

export type ThemeItemType = {
  title: string;
  key: Theme;
  description: string;
};

type ThemeCellProps = {
  item: ThemeItemType;
  index: number;
  currentTheme: Theme;
  onChangeTheme: (theme: Theme) => void;
};

const themesList: ThemeItemType[] = [
  {
    title: 'System',
    key: 'system',
    description: 'Follow system appearance',
  },
  {
    title: 'Light',
    key: 'light',
    description: 'Light mode always',
  },
  {
    title: 'Dark',
    key: 'dark',
    description: 'Dark mode always',
  },
];

const ThemeCell = (props: ThemeCellProps) => {
  const { item, index, currentTheme, onChangeTheme } = props;
  const styles = useThemedStyles();
  const hapticSelection = useHaptic();
  const handlePress = () => {
    hapticSelection?.();
    onChangeTheme(item.key);
  };

  const isLastItem = index === themesList.length - 1;
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
  return (
    <Animated.View style={tailwind.style('pt-1 pb-4 pl-2')}>
      {themesList.map((item, index) => {
        return <ThemeCell key={index} {...{ item, index, currentTheme, onChangeTheme }} />;
      })}
    </Animated.View>
  );
};
