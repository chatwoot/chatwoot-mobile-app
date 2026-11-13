import React from 'react';
import { Path, Svg } from 'react-native-svg';

import { IconProps } from '../../types';

export const ChevronUpDownIcon = ({ stroke = '#646464' }: IconProps): JSX.Element => {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 9 14" fill="none">
      <Path
        d="M1.5 5L4.5 2L7.5 5M1.5 9L4.5 12L7.5 9"
        stroke={stroke}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
