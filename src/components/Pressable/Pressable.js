import { Pressable as NativePressable } from 'react-native';
import React from 'react';
import PropTypes from 'prop-types';
const propTypes = {
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  children: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  disabled: PropTypes.bool,
  onPress: PropTypes.func,
  onLongPress: PropTypes.func,
};

const Pressable = ({ onPress, onLongPress, disabled, children, style: customStyle }) => {
  return (
    <NativePressable
      testID="pressable"
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.6 : 1,
        },
        customStyle,
      ]}
      disabled={disabled}
      onPress={onPress}
      onLongPress={onLongPress}>
      {children}
    </NativePressable>
  );
};
Pressable.propTypes = propTypes;
export default Pressable;
