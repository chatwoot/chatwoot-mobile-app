import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text as NativeText } from 'react-native';
import createStyles, { setColor } from './Text.style';
import { useTheme } from '@react-navigation/native';
const propTypes = {
  xxs: PropTypes.bool,
  xs: PropTypes.bool,
  sm: PropTypes.bool,
  md: PropTypes.bool,
  lg: PropTypes.bool,
  xl: PropTypes.bool,
  xxl: PropTypes.bool,
  xxxl: PropTypes.bool,
  thin: PropTypes.bool,
  ultraLight: PropTypes.bool,
  light: PropTypes.bool,
  regular: PropTypes.bool,
  medium: PropTypes.bool,
  semiBold: PropTypes.bool,
  bold: PropTypes.bool,
  heavy: PropTypes.bool,
  normal: PropTypes.bool,
  color: PropTypes.string,
  capitalize: PropTypes.bool,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  children: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
};

const Text = ({
  xxs,
  xs,
  sm,
  md,
  lg,
  xl,
  xxl,
  xxxl,
  thin,
  ultraLight,
  light,
  regular,
  medium,
  semiBold,
  bold,
  heavy,
  normal,
  children,
  capitalize,
  color,
  style: customStyle,
  ...rest
}) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <NativeText
      style={StyleSheet.flatten([
        customStyle,
        xxs && styles.xxs,
        xs && styles.xs,
        sm && styles.sm,
        md && styles.md,
        lg && styles.lg,
        xl && styles.xl,
        xxl && styles.xxl,
        xxxl && styles.xxxl,
        thin && styles.thin,
        ultraLight && styles.ultraLight,
        light && styles.light,
        regular && styles.regular,
        medium && styles.medium,
        semiBold && styles.semiBold,
        bold && styles.bold,
        heavy && styles.heavy,
        normal && styles.normal,
        capitalize && styles.capitalize,
        setColor(color),
      ])}
      {...rest}>
      {children}
    </NativeText>
  );
};
Text.propTypes = propTypes;
export default Text;
