import { StyleSheet } from 'react-native';

export const setColor = color => {
  return {
    color,
  };
};

export default theme => {
  const { fontWeight, fontSize } = theme;

  return StyleSheet.create({
    xxs: {
      fontSize: fontSize.xxs,
    },
    xs: {
      fontSize: fontSize.xs,
    },
    sm: {
      fontSize: fontSize.sm,
    },
    md: {
      fontSize: fontSize.md,
    },
    lg: {
      fontSize: fontSize.lg,
    },
    xl: {
      fontSize: fontSize.xl,
    },
    xxl: {
      fontSize: fontSize.xxl,
    },
    xxxl: {
      fontSize: fontSize.xxxl,
    },

    thin: {
      fontWeight: fontWeight.thin,
    },
    ultraLight: {
      fontWeight: fontWeight.ultraLight,
    },
    light: {
      fontWeight: fontWeight.light,
    },
    regular: {
      fontWeight: fontWeight.regular,
    },
    medium: {
      fontWeight: fontWeight.medium,
    },
    semiBold: {
      fontWeight: fontWeight.semiBold,
    },
    heavy: {
      fontWeight: fontWeight.heavy,
    },
    bold: {
      fontWeight: fontWeight.bold,
    },
    normal: {
      fontWeight: fontWeight.normal,
    },
    capitalize: {
      textTransform: 'capitalize',
    },
  });
};
