/**
 * Themed Styles Hook
 *
 * Provides dynamic styles based on current theme (light/dark)
 * Returns inline style objects to bypass NativeWind compilation issues
 *
 * ✅ SINGLE SOURCE OF TRUTH: Uses colors from @/theme/colors/index
 */

import { StyleSheet } from 'react-native';
import { useTheme } from '@/context';
import { THEME_COLORS } from './colors';

export const useThemedStyles = () => {
  const { isDark } = useTheme();
  const colors = isDark ? THEME_COLORS.dark : THEME_COLORS.light;

  return {
    // Raw color values
    colors,

    // Background styles
    bgPrimary: { backgroundColor: colors.bgPrimary },
    bgSecondary: { backgroundColor: colors.bgSecondary },
    bgTertiary: { backgroundColor: colors.bgTertiary },
    bgPressed: { backgroundColor: colors.bgPressed },
    bgInput: { backgroundColor: colors.bgInput },

    // Text styles
    textPrimary: { color: colors.textPrimary },
    textSecondary: { color: colors.textSecondary },
    textTertiary: { color: colors.textTertiary },
    textLink: { color: colors.textLink },

    // Icon color (for SVG stroke)
    iconColor: colors.iconColor,

    // Border styles
    border: { borderColor: colors.border },
    borderStyle: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
    borderStyleLegacy: { borderWidth: 1, borderColor: colors.border }, // For components that need thicker borders

    // Divider
    divider: { backgroundColor: colors.divider },

    // Sheet components
    sheetBg: { backgroundColor: colors.sheetBg },
    sheetIndicator: { backgroundColor: colors.sheetIndicator },

    // States
    stateError: { color: colors.stateError },

    // Button styles
    btnPrimary: {
      bg: { backgroundColor: colors.btnPrimaryBg },
      bgPressed: { backgroundColor: colors.btnPrimaryBgPressed },
      bgDisabled: { backgroundColor: colors.btnPrimaryBgDisabled },
      text: { color: colors.btnPrimaryText },
      textDisabled: { color: colors.btnPrimaryTextDisabled },
    },
    btnSecondary: {
      bg: { backgroundColor: colors.btnSecondaryBg },
      bgPressed: { backgroundColor: colors.btnSecondaryBgPressed },
      bgDisabled: { backgroundColor: colors.btnSecondaryBgDisabled },
      text: { color: colors.btnSecondaryText },
      textDisabled: { color: colors.btnSecondaryTextDisabled },
    },

    // Status bar
    statusBar: (isDark ? 'light-content' : 'dark-content') as 'light-content' | 'dark-content',

    // Helper
    isDark,
  };
};

/**
 * Get individual themed color value
 */
export const useThemedColor = (lightColor: string, darkColor: string): string => {
  const { isDark } = useTheme();
  return isDark ? darkColor : lightColor;
};
