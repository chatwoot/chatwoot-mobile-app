import React from 'react';
import Svg, { Path } from 'react-native-svg';

import { IconProps } from '../../types';

export const Building2 = ({ stroke = '#858585', strokeWidth = 1.8 }: IconProps) => {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 22V4C6 2.89543 6.89543 2 8 2H16C17.1046 2 18 2.89543 18 4V22M6 12H4C2.89543 12 2 12.8954 2 14V20C2 21.1046 2.89543 22 4 22H6M18 9H20C21.1046 9 22 9.89543 22 11V20C22 21.1046 21.1046 22 20 22H18M10 6H14M10 10H14M10 14H14M10 18H14"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
