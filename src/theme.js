import { DefaultTheme } from '@react-navigation/native';

export const palette = {
  background: '#FFFFFF',
  backgroundLight: '#F8FAFC',
  backgroundDark: '#E4EBF1',

  backdropColor: 'rgba(0, 0, 0, 0.5)',

  backgroundChat: '#f4f6fb',
  backgroundPrivate: '#FFEDBF',
  backgroundPrivateLight: '#FFF4D9',
  backgroundDate: '#e1f5feeb',
  backgroundActivity: '#e7eefb',

  primaryColor: '#1F93FF',
  primaryColorDark: '#1976CC',
  primaryColorDarker: '#135899',
  primaryColorLight: '#EBF5FF',

  infoColor: '#077BFF',
  infoColorDark: '#055FDB',
  infoColorDarker: '#0346B7',
  infoColorLight: '#9BD8FF',
  infoColorLighter: '#C2E1FF',

  secondaryColor: '#5d7592',
  secondaryColorLight: '#C9D7E3',
  secondaryColorDarker: '#293F51',

  successColor: '#44CE4B',
  violetColor: '#AC52FF',

  dangerColor: '#ff382d',
  dangerColorDark: '#ed2f2f',
  dangerColorDarker: '#930F1F',
  dangerColorLight: '#FFCCD1',

  warningColor: '#ffc532',
  warningColorLight: '#FFEDBF',
  warningColorDarker: '#7A4D09',

  colorWhite: '#FFFFFF',

  colorBlack: '#000000',
  colorBlackLight: '#96979C',

  textGrayLighter: '#aec3d5',
  textLighter: '#779bbb',
  textLight: '#446888',
  text: '#37546D',
  textDark: '#293F51',
  textDarker: '#1f2d3d',
  blockColor: '#d6ebff',

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

    backdropColor: 'rgba(0, 0, 0, 0.5)',

    backgroundChat: '#f4f6fb',
    backgroundPrivate: '#FFEDBF',
    backgroundPrivateLight: '#FFF4D9',
    backgroundDate: '#e1f5feeb',
    backgroundActivity: '#e7eefb',

    primaryColor: '#1F93FF',
    primaryColorDark: '#47A6FF',
    primaryColorLight: '#1976CC',

    infoColor: '#077BFF',
    infoColorDark: '#055FDB',
    infoColorDarker: '#0346B7',
    infoColorLight: '#9BD8FF',
    infoColorLighter: '#C2E1FF',

    secondaryColor: '#5d7592',
    secondaryColorLight: '#C9D7E3',
    secondaryColorDarker: '#293F51',

    successColor: '#00C41D',
    violetColor: '#AC52FF',

    dangerColor: '#ff382d',
    dangerColorDark: '#ed2f2f',
    dangerColorDarker: '#930F1F',
    dangerColorLight: '#FFCCD1',

    warningColor: '#ffc532',
    warningColorLight: '#FFEDBF',
    warningColorDarker: '#7A4D09',

    colorWhite: '#FFFFFF',

    colorBlack: '#000000',
    colorBlackLight: '#96979C',

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
