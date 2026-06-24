import React from 'react';
import Svg, { Path } from 'react-native-svg';

import { IconProps } from '../../types';

export const ChartSpline = ({ stroke = '#858585', strokeWidth = 1.8 }: IconProps) => {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 3V19C3 20.1046 3.89543 21 5 21H21"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M7 16C7.6 13.4 9.1 9 11 9C13 9 13 12 15 12C17.3 12 19.4 7.4 20 5"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
