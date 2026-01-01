/**
 * Semantic Color Mappings
 *
 * Maps brand colors to semantic usage in the UI
 * This provides a single source of truth for color usage across the app
 */

module.exports = {
  // Primary action colors (buttons, CTAs)
  primary: {
    DEFAULT: '#007FB6', // oceanElectric-600
    hover: '#0096C7', // oceanCyan-600
    pressed: '#006592', // oceanElectric-700
    disabled: '#99D7EF', // oceanElectric-200
    light: '#E6F5FB', // oceanElectric-50
  },

  // Secondary action colors
  secondary: {
    DEFAULT: '#48CAE4', // oceanTurquoise-600
    hover: '#69D7EB', // oceanTurquoise-500
    pressed: '#2DB5D3', // oceanTurquoise-700
    disabled: '#C3EFF7', // oceanTurquoise-200
    light: '#F0FBFD', // oceanTurquoise-50
  },

  // Text colors
  text: {
    primary: '#0D1B2A', // oceanBlack-600
    secondary: '#ADB5BD', // oceanCoral-500
    tertiary: '#CED4DA', // oceanCoral-400
    inverse: '#FFFFFF', // white
    link: '#007FB6', // oceanElectric-600
    linkHover: '#0096C7', // oceanCyan-600
  },

  // Background colors
  background: {
    primary: '#FFFFFF', // white
    secondary: '#F8F9FA', // oceanCoral-50
    dark: '#012A4A', // oceanDeep-600
    darkAlt: '#0D1B2A', // oceanBlack-600
    input: 'rgba(72, 202, 228, 0.08)', // oceanTurquoise-600 at 8%
    overlay: 'rgba(1, 42, 74, 0.8)', // oceanDeep-600 at 80%
  },

  // Border colors
  border: {
    DEFAULT: 'rgba(173, 181, 189, 0.2)', // oceanCoral-500 at 20%
    light: 'rgba(173, 181, 189, 0.1)', // oceanCoral-500 at 10%
    medium: 'rgba(173, 181, 189, 0.3)', // oceanCoral-500 at 30%
    dark: '#ADB5BD', // oceanCoral-500
    focus: '#0096C7', // oceanCyan-600
  },

  // State colors
  state: {
    focus: '#0096C7', // oceanCyan-600
    active: '#007FB6', // oceanElectric-600
    disabled: 'rgba(173, 181, 189, 0.4)', // oceanCoral-500 at 40%
    error: '#DC2626', // Keep existing error red
    success: '#16A34A', // Keep existing success green
    warning: '#F59E0B', // Keep existing warning amber
  },
};
