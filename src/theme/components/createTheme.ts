/**
 * Theme Creation Utility
 * 
 * This file provides utilities for creating theme-aware Tailwind configurations
 * that match the web application's color system.
 */

import { create } from 'twrnc';
import { twConfig } from '../tailwind.config';
import { UnifiedColorScale } from '../colors/unified';
import { SemanticColors } from '../colors/semantic';

// Theme-aware Tailwind configuration interface
export interface ThemeAwareConfig {
  isDark: boolean;
  colors: UnifiedColorScale;
  semanticColors: SemanticColors;
}

// Create theme-aware Tailwind instance
export const createUnifiedTheme = (config: ThemeAwareConfig) => {
  const { isDark, colors, semanticColors } = config;
  
  return create({
    ...twConfig,
    theme: {
      ...twConfig.theme,
      extend: {
        ...twConfig.theme.extend,
        colors: {
          // Base color scales
          ...colors,
          
          // Semantic color mappings (matching web app)
          background: semanticColors.background,
          foreground: semanticColors.textPrimary,
          primary: semanticColors.primary,
          secondary: semanticColors.textSecondary,
          muted: semanticColors.textMuted,
          accent: semanticColors.accent,
          destructive: semanticColors.error,
          border: semanticColors.border,
          input: semanticColors.input,
          ring: semanticColors.primary,
          
          // Additional semantic mappings
          surface: semanticColors.surface,
          'surface-elevated': semanticColors.surfaceElevated,
          'surface-hover': semanticColors.surfaceHover,
          
          // Text colors
          'text-primary': semanticColors.textPrimary,
          'text-secondary': semanticColors.textSecondary,
          'text-muted': semanticColors.textMuted,
          'text-inverse': semanticColors.textInverse,
          
          // Interactive colors
          'primary-hover': semanticColors.primaryHover,
          'primary-active': semanticColors.primaryActive,
          'accent-hover': semanticColors.accentHover,
          
          // Status colors
          success: semanticColors.success,
          warning: semanticColors.warning,
          error: semanticColors.error,
          info: semanticColors.info,
          
          // Border colors
          'border-strong': semanticColors.borderStrong,
          'border-weak': semanticColors.borderWeak,
          'border-container': semanticColors.borderContainer,
          
          // Input colors
          'input-border': semanticColors.inputBorder,
          'input-focus': semanticColors.inputFocus,
          
          // Overlay colors
          overlay: semanticColors.overlay,
          backdrop: semanticColors.backdrop,
        },
        // Add theme-specific spacing and typography
        spacing: {
          ...twConfig.theme.extend.spacing,
          // Add consistent spacing scale
          'xs': 4,
          'sm': 8,
          'md': 16,
          'lg': 24,
          'xl': 32,
          '2xl': 48,
          '3xl': 64,
        },
        // Add consistent typography scale
        fontSize: {
          ...twConfig.theme.extend.fontSize,
          'xs': '12px',
          'sm': '14px',
          'base': '16px',
          'lg': '18px',
          'xl': '20px',
          '2xl': '24px',
          '3xl': '30px',
          '4xl': '36px',
        },
        // Add consistent line heights
        lineHeight: {
          'xs': 16,
          'sm': 20,
          'base': 24,
          'lg': 28,
          'xl': 28,
          '2xl': 32,
          '3xl': 40,
          '4xl': 44,
        },
      },
    },
  });
};

// Create theme-aware Tailwind instance with default config
export const createDefaultTheme = (isDark: boolean) => {
  const colors = isDark ? 
    require('../colors/unified').darkModeColorScales : 
    require('../colors/unified').lightModeColorScales;
  
  const semanticColors = isDark ?
    require('../colors/semantic').darkSemanticColors :
    require('../colors/semantic').lightSemanticColors;
  
  return createUnifiedTheme({
    isDark,
    colors,
    semanticColors,
  });
};

// Export theme creation utilities
export { createUnifiedTheme as createTheme };
