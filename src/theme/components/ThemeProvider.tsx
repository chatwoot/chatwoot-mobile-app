/**
 * Theme Provider
 * 
 * This component provides theme context to the entire application,
 * managing theme state and providing theme-aware utilities.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import { UnifiedColorScale, darkModeColorScales, lightModeColorScales } from '../colors/unified';
import { SemanticColors, createSemanticColors, darkSemanticColors, lightSemanticColors } from '../colors/semantic';

// Theme context interface
export interface ThemeContextType {
  isDark: boolean;
  colors: UnifiedColorScale;
  semanticColors: SemanticColors;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

// Create theme context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme provider props
interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: 'light' | 'dark' | 'system';
  enableSystemTheme?: boolean;
}

// Theme provider component
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialTheme = 'system',
  enableSystemTheme = true,
}) => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (initialTheme === 'system' && enableSystemTheme) {
      return Appearance.getColorScheme() === 'dark';
    }
    return initialTheme === 'dark';
  });

  // Listen to system theme changes
  useEffect(() => {
    if (!enableSystemTheme || initialTheme !== 'system') return;

    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setIsDark(colorScheme === 'dark');
    });

    return () => subscription?.remove();
  }, [enableSystemTheme, initialTheme]);

  // Get current color scales
  const colors: UnifiedColorScale = isDark ? darkModeColorScales : lightModeColorScales;
  
  // Get semantic colors
  const semanticColors: SemanticColors = isDark ? darkSemanticColors : lightSemanticColors;

  // Theme control functions
  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  const setTheme = (dark: boolean) => {
    setIsDark(dark);
  };

  // Context value
  const contextValue: ThemeContextType = {
    isDark,
    colors,
    semanticColors,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};

// Hook to get theme-aware colors
export const useThemeColors = () => {
  const { colors, semanticColors } = useTheme();
  return { colors, semanticColors };
};

// Hook to get theme state
export const useThemeState = () => {
  const { isDark, toggleTheme, setTheme } = useTheme();
  return { isDark, toggleTheme, setTheme };
};

// Export theme context for advanced usage
export { ThemeContext };
