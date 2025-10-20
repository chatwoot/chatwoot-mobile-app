/**
 * Theme Hook
 * 
 * This file provides a custom hook for theme-aware Tailwind styling
 * that automatically updates when the theme changes.
 */

import { useMemo } from 'react';
import { useTheme as useThemeContext } from './ThemeProvider';
import { createUnifiedTheme } from './createTheme';

// Custom hook for theme-aware Tailwind
export const useTheme = () => {
  const themeContext = useThemeContext();
  
  // Create theme-aware Tailwind instance
  const tailwind = useMemo(() => {
    return createUnifiedTheme({
      isDark: themeContext.isDark,
      colors: themeContext.colors,
      semanticColors: themeContext.semanticColors,
    });
  }, [themeContext.isDark, themeContext.colors, themeContext.semanticColors]);
  
  return {
    ...themeContext,
    tailwind,
  };
};

// Export the theme context hook as well
export { useTheme as useThemeContext, useThemeColors, useThemeState } from './ThemeProvider';
