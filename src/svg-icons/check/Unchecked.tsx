import React from 'react';
import { Circle, Svg } from 'react-native-svg';

import { IconProps } from '../../types';

export const UncheckedIcon = (props: IconProps) => {
  const { stroke = '#C7C7C7' } = props;
  return (
    <Svg width="100%" height="100%" viewBox="0 0 20 20" fill="none">
      <Circle cx="10" cy="10" r="9" stroke={stroke} strokeWidth="2" />
    </Svg>
  );
};
