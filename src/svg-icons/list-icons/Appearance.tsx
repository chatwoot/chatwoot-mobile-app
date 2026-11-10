import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

import { IconProps } from '../../types';

export const AppearanceIcon = ({ stroke = '#858585' }: IconProps): JSX.Element => {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={stroke} strokeWidth="1.5" />
      <Path d="M12 3a9 9 0 0 0 0 18V3Z" fill={stroke} />
    </Svg>
  );
};
