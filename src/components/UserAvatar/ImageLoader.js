import React from 'react';
import PropTypes from 'prop-types';
import { View, ActivityIndicator } from 'react-native';
import { useTheme } from '@react-navigation/native';

const ImageLoader = ({ style }) => {
  const theme = useTheme();
  const { colors } = theme;

  return (
    <View style={style}>
      <ActivityIndicator size="small" color={colors.colorWhite} />
    </View>
  );
};

const propTypes = {
  style: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.shape({})), PropTypes.shape({})]),
};

ImageLoader.propTypes = propTypes;
export default ImageLoader;
