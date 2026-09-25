import React from 'react';
import { Path, Svg } from 'react-native-svg';

import { IconProps } from '../../types';

export const PhoneOutlineIcon = ({
  stroke = '#858585',
  strokeWidth = '1.5',
}: IconProps): JSX.Element => {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
      <Path
        d="M20.9 16.92v2.5a1.8 1.8 0 0 1-1.96 1.8 17.8 17.8 0 0 1-7.76-2.76 17.5 17.5 0 0 1-5.4-5.4A17.8 17.8 0 0 1 3.02 5.26 1.8 1.8 0 0 1 4.8 3.3h2.5a1.8 1.8 0 0 1 1.8 1.55c.11.86.32 1.7.63 2.5a1.8 1.8 0 0 1-.4 1.9l-1.06 1.06a14.4 14.4 0 0 0 5.4 5.4l1.06-1.06a1.8 1.8 0 0 1 1.9-.4c.8.3 1.64.52 2.5.63a1.8 1.8 0 0 1 1.55 1.83Z"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
