import React from 'react';
import { Path, Svg } from 'react-native-svg';

import { IconProps } from '../../types';

export const CaretRight = ({ stroke = '#6F6F6F' }: IconProps): JSX.Element => {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 20 20" fill="none">
      <Path
        d="M8 15L13 10L8 5"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
