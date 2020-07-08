import { Button, useTheme, withStyles } from '@ui-kitten/components';
import PropTypes from 'prop-types';
import React from 'react';
import { ActivityIndicator } from 'react-native';
import CustomText from './Text';

const LoadingIndicator = () => {
  const theme = useTheme();
  return <ActivityIndicator size="small" color={theme['loader-color']} />;
};

const LoaderButton = ({ loading, text, ...customProps }) => {
  const {
    eva: {
      style: { textStyle },
    },
  } = customProps;

  return (
    <Button {...customProps} {...(loading && { accessoryLeft: LoadingIndicator })}>
      {loading ? null : <CustomText style={textStyle}>{text}</CustomText>}
    </Button>
  );
};

const propTypes = {
  loading: PropTypes.bool,
  text: PropTypes.string.isRequired,
};

const defaultProps = {
  loading: false,
};

LoaderButton.propTypes = propTypes;
LoaderButton.defaultProps = defaultProps;

const styles = (theme) => ({
  textStyle: {
    color: theme['color-basic-100'],
    fontWeight: theme['font-semi-bold'],
    fontSize: theme['font-size-medium'],
  },
});

export default withStyles(LoaderButton, styles);
