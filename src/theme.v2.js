import { DefaultTheme } from '@react-navigation/native';

export const palette = {
  background: '#FFFFFF',
  backgroundLight: '#F8FAFC',
  backgroundDark: '#E4EBF1',

  primaryColor: '#1F93FF',
  primaryColorDark: '#1976CC',
  primaryColorDarker: '#135899',
  primaryColorLight: '#EBF5FF',

  secondaryColor: '#5d7592',
  successColor: '#44CE4B',
  violetColor: '#AC52FF',

  dangerColor: '#ff382d',
  dangerColorLight: '#FFCCD1',

  warningColor: '#ffc532',
  warningColorLight: '#FFEDBF',

  colorWhite: '#FFFFFF',
  colorBlack: '#000000',

  textLighter: '#779bbb',
  textLight: '#446888',
  text: '#37546D',
  textDark: '#293F51',
  textDarker: '#1f2d3d',

  borderDark: '#37546D',
  border: '#C9D7E3',
  borderLight: '#EBF0F5',

  iconDark: '#293F51',
  icon: '#37546D',
  iconLight: '#446888',
};

export const spacing = {
  zero: 0,
  tiny: 2,
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
    backgroundDark: '#314155',

    backgroundChat: '#f4f6fb',

    primaryColor: '#1F93FF',
    primaryColorDark: '#47A6FF',
    primaryColorLight: '#1976CC',

    secondaryColor: '#5d7592',
    successColor: '#00C41D',
    violetColor: '#AC52FF',

    dangerColor: '#ff382d',
    dangerColorLight: '#FFCCD1',

    warningColor: '#ffc532',
    warningColorLight: '#FFEDBF',

    colorWhite: '#FFFFFF',
    colorBlack: '#000000',

    textLighter: '#779bbb',
    textLight: '#C9D7E3',
    text: '#F1F5F8',
    textDark: '#F8FAFC',
    textDarker: '#FFFFFF',

    borderDark: '#EBF0F5',
    border: '#C9D7E3',
    borderLight: '#293F51',

    iconDark: '#F8FAFC',
    icon: '#F1F5F8',
    iconLight: '#C9D7E3',
  },
  spacing,
  fontSize,
  borderRadius,
  fontWeight,
};
