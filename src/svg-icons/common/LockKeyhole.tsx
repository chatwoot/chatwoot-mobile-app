import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { IconProps } from '../../types';

export const LockKeyholeIcon = ({ stroke = '#858585' }: IconProps): JSX.Element => {
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <Circle cx="12" cy="16" r="1" />
      <Rect width="18" height="12" x="3" y="10" rx="2" />
      <Path d="M7 10V7a5 5 0 0 1 10 0v3" />
    </Svg>
  );
};
