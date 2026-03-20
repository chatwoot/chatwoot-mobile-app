import React from 'react';
import { Path, Svg } from 'react-native-svg';

import { IconProps } from '../../types';

export const SparkleIcon = ({ stroke = '#171717' }: IconProps): JSX.Element => {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
      <Path
        d="M9.5 2L11.3 6.7L16 8.5L11.3 10.3L9.5 15L7.7 10.3L3 8.5L7.7 6.7L9.5 2Z"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18 12L19 15L22 16L19 17L18 20L17 17L14 16L17 15L18 12Z"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
