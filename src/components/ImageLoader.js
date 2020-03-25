import React from 'react';
import PropTypes from 'prop-types';
import { View, ActivityIndicator } from 'react-native';
import { withStyles } from '@ui-kitten/components';

const ImageLoader = ({ style }) => {
  return (
    <View style={style}>
      <ActivityIndicator size="small" />
    </View>
  );
};

const propTypes = {
  style: PropTypes.object,
};

const styles = theme => ({});

ImageLoader.propTypes = propTypes;
export default withStyles(ImageLoader, styles);
