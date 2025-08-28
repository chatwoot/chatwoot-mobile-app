import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeMode;
  isDark: boolean;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<ThemeMode>('system');

  // Determine if we should use dark mode
  const isDark = theme === 'system' ? systemColorScheme === 'dark' : theme === 'dark';

  useEffect(() => {
    // You can load the saved theme preference here
    // For now, we'll use 'system' as default
  }, []);

  const handleSetTheme = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    // You can save the theme preference here
    // AsyncStorage.setItem('theme', newTheme);
  };

  const value: ThemeContextType = {
    theme,
    isDark,
    setTheme: handleSetTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
