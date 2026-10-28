import React from 'react';
import { Circle, Path, Svg } from 'react-native-svg';

import { IconProps } from '../../types';

export const PauseCircleIcon = ({ stroke = '#AB6400' }: IconProps): JSX.Element => {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={stroke} strokeWidth="2" />
      <Path d="M10 15V9M14 15V9" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
};
