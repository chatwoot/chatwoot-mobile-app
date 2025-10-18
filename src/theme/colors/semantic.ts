/**
 * Semantic Color Mappings
 *
 * This file provides semantic color mappings that match the web application's
 * color system, ensuring consistent visual hierarchy and meaning across platforms.
 */

import { UnifiedColorScale } from './unified';

// Semantic color interface
export interface SemanticColors {
  // Background colors
  background: string; // Main app background
  surface: string; // Card/container backgrounds
  surfaceElevated: string; // Elevated surfaces (modals, dropdowns)
  surfaceHover: string; // Hover states

  // Text colors
  textPrimary: string; // Primary text
  textSecondary: string; // Secondary text
  textMuted: string; // Muted/disabled text
  textInverse: string; // Text on dark backgrounds

  // Interactive colors
  primary: string; // Primary brand color
  primaryHover: string; // Primary hover state
  primaryActive: string; // Primary active state
  accent: string; // Accent color
  accentHover: string; // Accent hover state

  // Status colors
  success: string; // Success state
  warning: string; // Warning state
  error: string; // Error state
  info: string; // Info state

  // Border colors
  border: string; // Default borders
  borderStrong: string; // Strong borders
  borderWeak: string; // Subtle borders
  borderContainer: string; // Container borders

  // Input colors
  input: string; // Input backgrounds
  inputBorder: string; // Input borders
  inputFocus: string; // Input focus state

  // Overlay colors
  overlay: string; // Modal overlays
  backdrop: string; // Backdrop overlays
}

// Create semantic colors from unified color scale
export const createSemanticColors = (
  colors: UnifiedColorScale,
  isDark: boolean,
): SemanticColors => {
  if (isDark) {
    return {
      // Background colors (matching LoginScreen dark mode EXACTLY)
      background: 'rgb(27, 27, 27)', // Using grayDark-50 to match LoginScreen exactly
      surface: colors.slate[1], // --slate-1: 17 17 19
      surfaceElevated: colors.slate[2], // --slate-2: 24 25 27
      surfaceHover: colors.slate[3], // --slate-3: 33 34 37

      // Text colors
      textPrimary: colors.slate[12], // --slate-12: 237 238 240
      textSecondary: colors.slate[11], // --slate-11: 176 180 186
      textMuted: colors.slate[10], // --slate-10: 119 123 132
      textInverse: colors.slate[1], // --slate-1: 17 17 19 (inverse)

      // Interactive colors
      primary: colors.iris[9], // --iris-9: 91 91 214 (primary brand)
      primaryHover: colors.iris[8], // --iris-8: 89 88 177
      primaryActive: colors.iris[7], // --iris-7: 74 74 149
      accent: colors.blue[9], // --text-blue: 126 182 255
      accentHover: colors.blue[9], // --text-blue: 126 182 255

      // Status colors
      success: colors.teal[9], // --teal-9: 18 165 148
      warning: colors.amber[9], // --amber-9: 255 197 61
      error: colors.ruby[9], // --ruby-9: 229 70 102
      info: colors.blue[9], // --text-blue: 126 182 255

      // Border colors
      border: 'rgb(38, 38, 42)', // --border-weak: 38 38 42
      borderStrong: 'rgb(52, 52, 52)', // --border-strong: 52 52 52
      borderWeak: 'rgb(38, 38, 42)', // --border-weak: 38 38 42
      borderContainer: 'rgba(236, 236, 236, 0)', // --border-container: 236, 236, 236, 0

      // Input colors
      input: colors.slate[2], // --slate-2: 24 25 27
      inputBorder: 'rgb(38, 38, 42)', // --border-weak: 38 38 42
      inputFocus: colors.iris[9], // --iris-9: 91 91 214

      // Overlay colors
      overlay: 'rgba(0, 0, 0, 0.6)', // Modal overlay
      backdrop: 'rgba(0, 0, 0, 0.4)', // Backdrop overlay
    };
  } else {
    return {
      // Background colors (light mode)
      background: 'rgb(255, 255, 255)', // White background
      surface: colors.slate[1], // Light surface
      surfaceElevated: colors.slate[2], // Elevated surface
      surfaceHover: colors.slate[3], // Hover surface

      // Text colors
      textPrimary: colors.slate[12], // Dark text
      textSecondary: colors.slate[11], // Secondary text
      textMuted: colors.slate[10], // Muted text
      textInverse: colors.slate[1], // Light text

      // Interactive colors
      primary: colors.iris[9], // Brand color
      primaryHover: colors.iris[8], // Brand hover
      primaryActive: colors.iris[7], // Brand active
      accent: colors.blue[9], // Accent color
      accentHover: colors.blue[8], // Accent hover

      // Status colors
      success: colors.teal[9], // Success
      warning: colors.amber[9], // Warning
      error: colors.ruby[9], // Error
      info: colors.blue[9], // Info

      // Border colors
      border: colors.slate[6], // Default border
      borderStrong: colors.slate[8], // Strong border
      borderWeak: colors.slate[4], // Weak border
      borderContainer: colors.slate[3], // Container border

      // Input colors
      input: colors.slate[1], // Input background
      inputBorder: colors.slate[6], // Input border
      inputFocus: colors.iris[9], // Input focus

      // Overlay colors
      overlay: 'rgba(0, 0, 0, 0.4)', // Modal overlay
      backdrop: 'rgba(0, 0, 0, 0.2)', // Backdrop overlay
    };
  }
};

// Predefined semantic color sets (matching LoginScreen dark mode EXACTLY)
export const darkSemanticColors: SemanticColors = {
  background: 'rgb(27, 27, 27)', // Using grayDark-50 to match LoginScreen exactly
  surface: 'rgb(17, 17, 19)', // --slate-1: 17 17 19
  surfaceElevated: 'rgb(24, 25, 27)', // --slate-2: 24 25 27
  surfaceHover: 'rgb(33, 34, 37)', // --slate-3: 33 34 37
  textPrimary: 'rgb(237, 238, 240)', // --slate-12: 237 238 240
  textSecondary: 'rgb(176, 180, 186)', // --slate-11: 176 180 186
  textMuted: 'rgb(119, 123, 132)', // --slate-10: 119 123 132
  textInverse: 'rgb(17, 17, 19)', // --slate-1: 17 17 19 (inverse)
  primary: 'rgb(91, 91, 214)', // --iris-9: 91 91 214 (primary brand)
  primaryHover: 'rgb(89, 88, 177)', // --iris-8: 89 88 177
  primaryActive: 'rgb(74, 74, 149)', // --iris-7: 74 74 149
  accent: 'rgb(126, 182, 255)', // --text-blue: 126 182 255
  accentHover: 'rgb(126, 182, 255)', // --text-blue: 126 182 255
  success: 'rgb(18, 165, 148)', // --teal-9: 18 165 148
  warning: 'rgb(255, 197, 61)', // --amber-9: 255 197 61
  error: 'rgb(229, 70, 102)', // --ruby-9: 229 70 102
  info: 'rgb(126, 182, 255)', // --text-blue: 126 182 255
  border: 'rgb(38, 38, 42)', // --border-weak: 38 38 42
  borderStrong: 'rgb(52, 52, 52)', // --border-strong: 52 52 52
  borderWeak: 'rgb(38, 38, 42)', // --border-weak: 38 38 42
  borderContainer: 'rgba(236, 236, 236, 0)', // --border-container: 236, 236, 236, 0
  input: 'rgb(24, 25, 27)', // --slate-2: 24 25 27
  inputBorder: 'rgb(38, 38, 42)', // --border-weak: 38 38 42
  inputFocus: 'rgb(91, 91, 214)', // --iris-9: 91 91 214
  overlay: 'rgba(0, 0, 0, 0.6)', // Modal overlay
  backdrop: 'rgba(0, 0, 0, 0.4)', // Backdrop overlay
};

export const lightSemanticColors: SemanticColors = {
  background: 'rgb(255, 255, 255)',
  surface: 'rgb(255, 255, 255)',
  surfaceElevated: 'rgb(248, 250, 252)',
  surfaceHover: 'rgb(241, 245, 249)',
  textPrimary: 'rgb(2, 6, 23)',
  textSecondary: 'rgb(15, 23, 42)',
  textMuted: 'rgb(30, 41, 59)',
  textInverse: 'rgb(255, 255, 255)',
  primary: 'rgb(89, 88, 177)',
  primaryHover: 'rgb(67, 56, 202)',
  primaryActive: 'rgb(55, 48, 163)',
  accent: 'rgb(59, 130, 246)',
  accentHover: 'rgb(37, 99, 235)',
  success: 'rgb(20, 184, 166)',
  warning: 'rgb(245, 158, 11)',
  error: 'rgb(220, 38, 127)',
  info: 'rgb(59, 130, 246)',
  border: 'rgb(148, 163, 184)',
  borderStrong: 'rgb(100, 116, 139)',
  borderWeak: 'rgb(226, 232, 240)',
  borderContainer: 'rgb(241, 245, 249)',
  input: 'rgb(255, 255, 255)',
  inputBorder: 'rgb(148, 163, 184)',
  inputFocus: 'rgb(89, 88, 177)',
  overlay: 'rgba(0, 0, 0, 0.4)',
  backdrop: 'rgba(0, 0, 0, 0.2)',
};
