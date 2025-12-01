import React, { createContext, useContext, useEffect, ReactNode } from 'react';
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

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectTheme) || 'system';
  const systemColorScheme = Appearance.getColorScheme();

  const colorScheme: ColorSchemeName =
    theme === 'system' ? systemColorScheme : theme === 'dark' ? 'dark' : 'light';

  const isDark = colorScheme === 'dark';

  useEffect(() => {
    if (theme === 'system') {
      const subscription = Appearance.addChangeListener(({ colorScheme: newColorScheme }) => {
        tailwind.setColorScheme(newColorScheme);
      });
      return () => subscription.remove();
    } else {
      tailwind.setColorScheme(colorScheme);
    }
  }, [theme, colorScheme]);

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
