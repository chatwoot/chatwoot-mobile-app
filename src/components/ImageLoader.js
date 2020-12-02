import React from 'react';
import PropTypes from 'prop-types';
import { View, ActivityIndicator } from 'react-native';
import { withStyles } from '@ui-kitten/components';
import { theme } from '../theme';

const ImageLoader = ({ style }) => {
  return (
    <View style={style}>
      <ActivityIndicator size="small" color={theme['loader-color']} />
    </View>
  );
};

const propTypes = {
  style: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.shape({})), PropTypes.shape({})]),
};

const styles = () => ({});

ImageLoader.propTypes = propTypes;
export default withStyles(ImageLoader, styles);
