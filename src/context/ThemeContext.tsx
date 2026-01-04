import React, { createContext, useContext, useEffect, useMemo, useCallback } from 'react';
import { useColorScheme, StatusBar } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { selectTheme } from '@/store/settings/settingsSelectors';
import { setTheme } from '@/store/settings/settingsSlice';
import { Theme } from '@/types/common/Theme';

// Color palette for light and dark themes
export const lightColors = {
  // Backgrounds
  background: 'hsl(230, 20%, 98%)',
  backgroundSecondary: 'hsl(230, 15%, 94%)',
  backgroundTertiary: 'hsl(230, 10%, 92%)',
  card: '#FFFFFF',
  
  // Text
  text: 'hsl(230, 25%, 12%)',
  textSecondary: 'hsl(230, 10%, 45%)',
  textTertiary: 'hsl(230, 10%, 65%)',
  textInverse: '#FFFFFF',
  
  // Primary
  primary: 'hsl(230, 100%, 60%)',
  primaryLight: 'hsl(230, 95%, 95%)',
  primaryDark: 'hsl(230, 85%, 52%)',
  
  // Secondary
  secondary: 'hsl(70, 100%, 55%)',
  
  // Status
  success: 'hsl(150, 70%, 40%)',
  warning: 'hsl(45, 85%, 48%)',
  error: 'hsl(0, 75%, 52%)',
  
  // UI Elements
  border: 'hsl(230, 10%, 87%)',
  borderLight: 'hsl(230, 10%, 92%)',
  divider: 'hsl(230, 10%, 92%)',
  icon: 'hsl(230, 10%, 45%)',
  iconSecondary: 'hsl(230, 10%, 65%)',
  
  // Interactive
  buttonBackground: 'hsl(230, 100%, 60%)',
  buttonText: '#FFFFFF',
  inputBackground: 'hsl(230, 15%, 94%)',
  inputBorder: 'hsl(230, 10%, 87%)',
  placeholder: 'hsl(230, 10%, 65%)',
  
  // Chat
  messageBubble: 'hsl(230, 15%, 94%)',
  messageBubbleSent: 'hsl(230, 100%, 60%)',
  
  // Status bar
  statusBar: 'dark-content' as const,
};

export const darkColors = {
  // Backgrounds
  background: 'hsl(230, 10%, 10%)',
  backgroundSecondary: 'hsl(230, 8%, 14%)',
  backgroundTertiary: 'hsl(230, 7%, 18%)',
  card: 'hsl(230, 8%, 14%)',
  
  // Text
  text: 'hsl(230, 2%, 92%)',
  textSecondary: 'hsl(230, 4%, 65%)',
  textTertiary: 'hsl(230, 5%, 55%)',
  textInverse: 'hsl(230, 25%, 12%)',
  
  // Primary
  primary: 'hsl(230, 100%, 65%)',
  primaryLight: 'hsl(230, 30%, 20%)',
  primaryDark: 'hsl(230, 85%, 70%)',
  
  // Secondary
  secondary: 'hsl(70, 100%, 55%)',
  
  // Status
  success: 'hsl(150, 65%, 50%)',
  warning: 'hsl(45, 80%, 55%)',
  error: 'hsl(0, 70%, 58%)',
  
  // UI Elements
  border: 'hsl(230, 6%, 26%)',
  borderLight: 'hsl(230, 7%, 22%)',
  divider: 'hsl(230, 6%, 22%)',
  icon: 'hsl(230, 4%, 65%)',
  iconSecondary: 'hsl(230, 5%, 55%)',
  
  // Interactive
  buttonBackground: 'hsl(230, 100%, 65%)',
  buttonText: '#FFFFFF',
  inputBackground: 'hsl(230, 7%, 18%)',
  inputBorder: 'hsl(230, 6%, 26%)',
  placeholder: 'hsl(230, 5%, 55%)',
  
  // Chat
  messageBubble: 'hsl(230, 7%, 22%)',
  messageBubbleSent: 'hsl(230, 100%, 50%)',
  
  // Status bar
  statusBar: 'light-content' as const,
};

export type ThemeColors = typeof lightColors | typeof darkColors;

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  colors: ThemeColors;
  setThemeMode: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const themePreference = useAppSelector(selectTheme);
  const systemColorScheme = useColorScheme();

  // Determine if dark mode should be active
  const isDark = useMemo(() => {
    if (themePreference === 'system') {
      return systemColorScheme === 'dark';
    }
    return themePreference === 'dark';
  }, [themePreference, systemColorScheme]);

  // Get colors based on theme
  const colors = useMemo(() => {
    return isDark ? darkColors : lightColors;
  }, [isDark]);

  // Set theme mode
  const setThemeMode = useCallback((newTheme: Theme) => {
    dispatch(setTheme(newTheme));
  }, [dispatch]);

  // Update status bar style
  useEffect(() => {
    StatusBar.setBarStyle(colors.statusBar);
    if (isDark) {
      StatusBar.setBackgroundColor?.(darkColors.background);
    } else {
      StatusBar.setBackgroundColor?.(lightColors.background);
    }
  }, [isDark, colors.statusBar]);

  const value = useMemo(() => ({
    theme: themePreference,
    isDark,
    colors,
    setThemeMode,
  }), [themePreference, isDark, colors, setThemeMode]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
