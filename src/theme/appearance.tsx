import React, { createContext, PropsWithChildren, useContext, useLayoutEffect } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import { useAppSelector } from '@/hooks';
import { selectTheme } from '@/store/settings/settingsSelectors';

const AppearanceContext = createContext<'light' | 'dark'>('light');

export const AppearanceProvider = ({ children }: PropsWithChildren) => {
  const preference = useAppSelector(selectTheme) ?? 'system';
  const systemScheme = useColorScheme();
  const scheme =
    preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;

  // Native menus, glass, keyboard and alerts follow the same choice as the app.
  useLayoutEffect(() => {
    Appearance.setColorScheme(preference === 'system' ? 'unspecified' : preference);
    return () => Appearance.setColorScheme('unspecified');
  }, [preference]);

  return <AppearanceContext.Provider value={scheme}>{children}</AppearanceContext.Provider>;
};

export const useAppAppearance = () => useContext(AppearanceContext);
