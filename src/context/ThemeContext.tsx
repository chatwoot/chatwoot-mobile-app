import React, { createContext, useContext, useEffect, useLayoutEffect, useState, ReactNode } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { setTheme } from '@/store/settings/settingsSlice';
import { selectTheme } from '@/store/settings/settingsSelectors';
import { tailwind } from '@/theme';
import { Theme } from '@/types/common/Theme';

type ThemeContextType = {
  theme: Theme;
  colorScheme: ColorSchemeName;
  isDark: boolean;
  changeTheme: (newTheme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

type ThemeProviderProps = {
  children: ReactNode;
};

const getColorScheme = (theme: Theme, systemScheme: ColorSchemeName): ColorSchemeName => {
  if (theme === 'system') return systemScheme || 'light';
  return theme === 'dark' ? 'dark' : 'light';
};

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectTheme) || 'system';
  const [systemColorScheme, setSystemColorScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme()
  );

  const colorScheme = getColorScheme(theme, systemColorScheme);
  const isDark = colorScheme === 'dark';

  // Listen for system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme: newColorScheme }) => {
      setSystemColorScheme(newColorScheme);
    });
    return () => subscription.remove();
  }, []);

  // Apply theme immediately on mount and when it changes
  useLayoutEffect(() => {
    tailwind.setColorScheme(colorScheme);
  }, [colorScheme]);

  const changeTheme = (newTheme: Theme) => {
    dispatch(setTheme(newTheme));
  };

  return (
    <ThemeContext.Provider value={{ theme, colorScheme, isDark, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
