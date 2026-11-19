import React from 'react';
import { Path, Rect, Svg } from 'react-native-svg';

import { IconProps } from '../../types';

export const CalendarIcon = ({ stroke = '#646464' }: IconProps): JSX.Element => {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 20 20" fill="none">
      <Rect x="3" y="4.5" width="14" height="12.5" rx="2" stroke={stroke} strokeWidth="1.6" />
      <Path
        d="M3 8.5H17M7 2.75V5.75M13 2.75V5.75"
        stroke={stroke}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </Svg>
  );
};
