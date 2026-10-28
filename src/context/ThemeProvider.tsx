import React, { useCallback, useEffect, useMemo, ReactNode } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import * as SystemUI from 'expo-system-ui';
import { useAppColorScheme, useDeviceContext } from 'twrnc';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { setTheme } from '@/store/settings/settingsSlice';
import { selectTheme } from '@/store/settings/settingsSelectors';
import { tailwind } from '@/theme';
import { Theme } from '@/types/common/Theme';
import { resolveColorScheme } from '@/utils/themeUtils';
import { ThemeContext } from './ThemeContext';

type ThemeProviderProps = {
  children: ReactNode;
};

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectTheme) || 'system';
  const systemColorScheme = useColorScheme();
  const colorScheme = resolveColorScheme(theme, systemColorScheme);

  useDeviceContext(tailwind, {
    observeDeviceColorSchemeChanges: false,
    initialColorScheme: colorScheme,
  });
  const [appliedColorScheme, , setColorScheme] = useAppColorScheme(tailwind);

  // Apply the scheme before the children render so their styles are built for it in this pass.
  if (appliedColorScheme !== colorScheme) {
    setColorScheme(colorScheme);
  }

  // Native surfaces (alerts, menus, sheets, the keyboard) follow the in-app choice too.
  useEffect(() => {
    Appearance.setColorScheme(theme === 'system' ? 'unspecified' : theme);
  }, [theme]);

  // The window behind the React tree shows through during transitions and keyboard resizes.
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(tailwind.color('bg-white dark:bg-grayDark-50') as string);
  }, [colorScheme]);

  const changeTheme = useCallback(
    (newTheme: Theme) => {
      dispatch(setTheme(newTheme));
    },
    [dispatch],
  );

  const value = useMemo(
    () => ({ theme, colorScheme, isDark: colorScheme === 'dark', changeTheme }),
    [theme, colorScheme, changeTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
