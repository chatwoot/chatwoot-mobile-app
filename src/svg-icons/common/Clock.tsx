import React from 'react';
import { Circle, Path, Svg } from 'react-native-svg';

import { IconProps } from '../../types';

export const ClockIcon = ({ stroke = '#858585', strokeWidth = 1.5 }: IconProps): JSX.Element => {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={stroke} strokeWidth={strokeWidth} />
      <Path
        d="M12 6V12L16 14"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
