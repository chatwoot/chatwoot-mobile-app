import { DefaultTheme } from '@react-navigation/native';

export const palette = {
  background: '#FFFFFF',
  backgroundLight: '#F8FAFC',
  primaryColor: '#1F93FF',
};

export const spacing = {
  zero: 0,
  micro: 4,
  smaller: 8,
  half: 12,
  small: 16,
  medium: 24,
  large: 32,
  larger: 48,
};

export const fontSize = {
  xxs: 10,
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};
export const borderRadius = {
  zero: 0,
  micro: 4,
  small: 8,
  medium: 12,
  large: 16,
  larger: 24,
  largest: 32,
  full: 48,
};

export const fontWeight = {
  thin: '100',
  ultraLight: '200',
  light: '300',
  regular: '400',
  medium: '500',
  semiBold: '600',
  heavy: '800',
  bold: 'bold',
  normal: 'normal',
};

export const LightTheme = {
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    ...palette,
  },
  spacing,
  fontSize,
  borderRadius,
  fontWeight,
};

export const DarkTheme = {
  ...DefaultTheme,
  colors: {
    ...LightTheme.colors,
    background: '#0D1721',
    backgroundLight: '#1F2D3D',
  },
  spacing,
  fontSize,
  borderRadius,
  fontWeight,
};
