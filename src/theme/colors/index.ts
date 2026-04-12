/**
 * Unified Color System
 *
 * Central source of truth for all theme colors
 * Maps semantic colors from design system to light/dark modes
 */

import { BRAND_COLORS } from './brand';
import { SEMANTIC_COLORS } from './semantic';

const grayDark = {
  50: 'hsl(0, 0%, 10.5%)',
  300: '#262626',
  600: '#525252',
  700: '#737373',
} as const;

/**
 * Theme Color Configuration
 * Uses semantic colors as the single source of truth
 */
export const THEME_COLORS = {
  light: {
    // Backgrounds
    bgPrimary: SEMANTIC_COLORS.background.primary,
    bgSecondary: SEMANTIC_COLORS.background.secondary,
    bgTertiary: '#E5E7EB', // Avatar background / tertiary elements (light gray)
    bgPressed: BRAND_COLORS.oceanCoral[200],
    bgInput: SEMANTIC_COLORS.background.input,

    // Text
    textPrimary: SEMANTIC_COLORS.text.primary,
    textSecondary: SEMANTIC_COLORS.text.secondary,
    textTertiary: SEMANTIC_COLORS.text.tertiary,
    textLink: SEMANTIC_COLORS.text.link,
    iconColor: '#858585', // Icon stroke color in light mode

    // Borders
    border: SEMANTIC_COLORS.border.DEFAULT,
    divider: BRAND_COLORS.oceanCoral[200],

    // Sheet/Modal components
    sheetBg: SEMANTIC_COLORS.background.primary,
    sheetIndicator: 'rgba(0, 0, 0, 0.133)',

    // States
    stateError: SEMANTIC_COLORS.state.error,

    // Buttons
    btnPrimaryBg: SEMANTIC_COLORS.primary.hover,
    btnPrimaryBgPressed: SEMANTIC_COLORS.primary.pressed,
    btnPrimaryBgDisabled: SEMANTIC_COLORS.primary.disabled,
    btnPrimaryText: SEMANTIC_COLORS.text.inverse,
    btnPrimaryTextDisabled: SEMANTIC_COLORS.text.secondary,
    btnSecondaryBg: SEMANTIC_COLORS.background.secondary,
    btnSecondaryBgPressed: BRAND_COLORS.oceanCoral[200],
    btnSecondaryBgDisabled: SEMANTIC_COLORS.background.secondary,
    btnSecondaryText: SEMANTIC_COLORS.text.primary,
    btnSecondaryTextDisabled: SEMANTIC_COLORS.text.secondary,
  },

  dark: {
    // Backgrounds
    bgPrimary: SEMANTIC_COLORS.background.darkAlt,
    bgSecondary: '#161E31', // Card background with better contrast
    bgTertiary: '#2A3847', // Avatar background / tertiary elements
    bgPressed: 'rgba(255, 255, 255, 0.05)', // Very subtle pressed state overlay
    bgInput: '#161E31', // Input fields

    // Text
    textPrimary: SEMANTIC_COLORS.text.inverse,
    textSecondary: '#8B95A0', // Muted gray for secondary text (email, subtitles)
    textTertiary: '#6B7280', // Darker gray for section headers (PREFERENCES, SUPPORT)
    textLink: BRAND_COLORS.oceanElectric[700],
    iconColor: '#9CA3AF', // Icon stroke color in dark mode

    // Borders
    border: 'rgba(255, 255, 255, 0.06)', // Very subtle borders between items (matching design)
    divider: 'rgba(255, 255, 255, 0.08)', // Slightly more visible dividers

    // Sheet/Modal components
    sheetBg: '#171717', // brandColors.grayDark[50]
    sheetIndicator: grayDark[600],

    // States
    stateError: SEMANTIC_COLORS.state.error,

    // Buttons
    btnPrimaryBg: BRAND_COLORS.oceanElectric[700],
    btnPrimaryBgPressed: BRAND_COLORS.oceanDeep[600],
    btnPrimaryBgDisabled: grayDark[300],
    btnPrimaryText: SEMANTIC_COLORS.text.inverse,
    btnPrimaryTextDisabled: grayDark[700],
    btnSecondaryBg: '#1E293B',
    btnSecondaryBgPressed: '#2A3847',
    btnSecondaryBgDisabled: '#161E31',
    btnSecondaryText: SEMANTIC_COLORS.text.inverse,
    btnSecondaryTextDisabled: '#8B95A0',
  },
} as const;

export type ThemeMode = keyof typeof THEME_COLORS;
