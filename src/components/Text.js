import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Text, StyleSheet } from 'react-native';

const getFontFamily = ({ locale, fontWeight = 400 }) => {
  const InterTextMapping = {
    300: '-Light',
    400: '-Regular',
    500: '-Medium',
    600: '-Semibold',
    700: '-Bold',
    800: '-Bold',
    900: '-Bold',
  };

  return `Inter${InterTextMapping[fontWeight]}`;
};

class CustomText extends Component {
  static propTypes = {
    locale: PropTypes.string,
  };

  static defaultProps = {
    locale: null,
  };

  generateStyles = styles => {
    const { locale } = this.props;
    const { fontWeight, ...rest } = styles;
    const fontStyles = {};
    fontStyles.fontFamily = getFontFamily({ locale, fontWeight });
    return {
      ...fontStyles,
      ...rest,
    };
  };

  render() {
    const { children, style } = this.props;
    const styles = this.generateStyles({ ...StyleSheet.flatten(style) });
    return (
      <Text {...this.props} style={styles}>
        {children}
      </Text>
    );
  }
}

export default CustomText;
