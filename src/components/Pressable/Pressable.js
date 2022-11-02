import { Pressable as NativePressable } from 'react-native';
import React from 'react';
import PropTypes from 'prop-types';
const propTypes = {
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  children: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  onPress: PropTypes.func,
};

const Pressable = ({ onPress, children, style: customStyle }) => {
  return (
    <NativePressable
      testID="pressable"
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.6 : 1,
        },
        customStyle,
      ]}
      onPress={onPress}>
      {children}
    </NativePressable>
  );
};
Pressable.propTypes = propTypes;
export default Pressable;
