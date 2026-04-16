import React from 'react';
import { StatusBar, StatusBarProps } from 'react-native';

import { tailwind, useAppTheme } from '@/theme';

type ThemedStatusBarProps = Omit<StatusBarProps, 'backgroundColor' | 'barStyle'> & {
  backgroundColorClassName?: string;
};

export const ThemedStatusBar = ({
  backgroundColorClassName = 'bg-white',
  translucent = true,
  ...statusBarProps
}: ThemedStatusBarProps) => {
  const { isDark } = useAppTheme();

  return (
    <StatusBar
      translucent={translucent}
      backgroundColor={tailwind.color(backgroundColorClassName)}
      barStyle={isDark ? 'light-content' : 'dark-content'}
      {...statusBarProps}
    />
  );
};
