/**
 * Unified Color System
 *
 * Central source of truth for all theme colors
 * Maps semantic colors from design system to light/dark modes
 */

/**
 * Semantic Colors (from semantic.ts)
 */
const semanticColors = {
  // Primary action colors
  primary: {
    DEFAULT: '#007FB6', // oceanElectric-600
    hover: '#0096C7', // oceanCyan-600
    pressed: '#006592', // oceanElectric-700
    disabled: '#99D7EF', // oceanElectric-200
  },

  // Text colors
  text: {
    primary: '#0D1B2A', // oceanBlack-600
    secondary: '#ADB5BD', // oceanCoral-500
    tertiary: '#CED4DA', // oceanCoral-400
    inverse: '#FFFFFF', // white
    link: '#007FB6', // oceanElectric-600
  },

  // Background colors
  background: {
    primary: '#FFFFFF', // white
    secondary: '#F8F9FA', // oceanCoral-50
    dark: '#012A4A', // oceanDeep-600
    darkAlt: '#0B1121', // oceanBlack-600
    input: 'rgba(72, 202, 228, 0.08)', // oceanTurquoise-600 at 8%
  },

  // Border colors
  border: {
    DEFAULT: 'rgba(173, 181, 189, 0.2)', // oceanCoral-500 at 20%
  },

  // State colors
  state: {
    error: '#DC2626',
  },
};

/**
 * Brand Colors (from brand.ts)
 */
const brandColors = {
  oceanBlack: {
    600: '#0D1B2A',
  },
  oceanDeep: {
    600: '#012A4A',
  },
  oceanElectric: {
    700: '#0077B6',
  },
  oceanCyan: {
    600: '#0096C7',
  },
  oceanTurquoise: {
    600: '#48CAE4',
  },
  oceanCoral: {
    200: '#E9ECEF',
    400: '#CED4DA',
    500: '#ADB5BD',
  },
  grayDark: {
    50: 'hsl(0, 0%, 10.5%)', // #1A1A1A approx
    300: '#262626',
    600: '#525252',
    700: '#737373',
  },
};

/**
 * Theme Color Configuration
 * Uses semantic colors as the single source of truth
 */
export const THEME_COLORS = {
  light: {
    // Backgrounds
    bgPrimary: semanticColors.background.primary,
    bgSecondary: semanticColors.background.secondary,
    bgTertiary: '#E5E7EB', // Avatar background / tertiary elements (light gray)
    bgPressed: '#E9ECEF', // Pressed state for list items
    bgInput: semanticColors.background.input,

    // Text
    textPrimary: semanticColors.text.primary,
    textSecondary: semanticColors.text.secondary,
    textTertiary: semanticColors.text.tertiary,
    textLink: semanticColors.text.link,
    iconColor: '#858585', // Icon stroke color in light mode

    // Borders
    border: semanticColors.border.DEFAULT,
    divider: brandColors.oceanCoral[200], // #E9ECEF

    // Sheet/Modal components
    sheetBg: semanticColors.background.primary,
    sheetIndicator: 'rgba(0, 0, 0, 0.133)',

    // States
    stateError: semanticColors.state.error,

    // Buttons
    btnPrimaryBg: semanticColors.primary.hover, // #0096C7
    btnPrimaryBgPressed: semanticColors.primary.pressed, // #006592
    btnPrimaryBgDisabled: semanticColors.primary.disabled, // #99D7EF
    btnPrimaryText: semanticColors.text.inverse, // #FFFFFF
    btnPrimaryTextDisabled: semanticColors.text.secondary, // #ADB5BD
    btnSecondaryBg: semanticColors.background.secondary, // #F8F9FA
    btnSecondaryBgPressed: brandColors.oceanCoral[200], // #E9ECEF
    btnSecondaryBgDisabled: semanticColors.background.secondary, // #F8F9FA
    btnSecondaryText: semanticColors.text.primary, // #0D1B2A
    btnSecondaryTextDisabled: semanticColors.text.secondary, // #ADB5BD
  },

  dark: {
    // Backgrounds
    bgPrimary: semanticColors.background.darkAlt, // #0D1B2A (main background)
    bgSecondary: '#161E31', // Card background with better contrast
    bgTertiary: '#2A3847', // Avatar background / tertiary elements
    bgPressed: 'rgba(255, 255, 255, 0.05)', // Very subtle pressed state overlay
    bgInput: '#161E31', // Input fields

    // Text
    textPrimary: semanticColors.text.inverse, // #FFFFFF (main text)
    textSecondary: '#8B95A0', // Muted gray for secondary text (email, subtitles)
    textTertiary: '#6B7280', // Darker gray for section headers (PREFERENCES, SUPPORT)
    textLink: brandColors.oceanElectric[700], // #0077B6
    iconColor: '#9CA3AF', // Icon stroke color in dark mode

    // Borders
    border: 'rgba(255, 255, 255, 0.06)', // Very subtle borders between items (matching design)
    divider: 'rgba(255, 255, 255, 0.08)', // Slightly more visible dividers

    // Sheet/Modal components
    sheetBg: '#171717', // brandColors.grayDark[50]
    sheetIndicator: brandColors.grayDark[600], // #525252

    // States
    stateError: semanticColors.state.error, // Same in both themes

    // Buttons
    btnPrimaryBg: brandColors.oceanElectric[700], // #0077B6
    btnPrimaryBgPressed: brandColors.oceanDeep[600], // #012A4A
    btnPrimaryBgDisabled: brandColors.grayDark[300], // #262626
    btnPrimaryText: semanticColors.text.inverse, // #FFFFFF
    btnPrimaryTextDisabled: brandColors.grayDark[700], // #737373
    btnSecondaryBg: '#1E293B',
    btnSecondaryBgPressed: '#2A3847',
    btnSecondaryBgDisabled: '#161E31',
    btnSecondaryText: semanticColors.text.inverse, // #FFFFFF
    btnSecondaryTextDisabled: '#8B95A0',
  },
} as const;

export type ThemeMode = keyof typeof THEME_COLORS;
