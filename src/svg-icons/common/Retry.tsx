import React from 'react';
import Svg, { Path } from 'react-native-svg';

import { IconProps } from '../../types';

export const RetryIcon = ({ stroke = '#858585' }: IconProps): JSX.Element => {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8M3 3v5h5M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16M21 21v-5h-5"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
