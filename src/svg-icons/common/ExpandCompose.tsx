import React from 'react';
import Svg, { Path } from 'react-native-svg';

import { IconProps } from '../../types';

/** Diagonal arrows pointing out: expand the reply field. */
export const ExpandComposeIcon = ({
  stroke = '#858585',
  strokeWidth = 1.5,
}: IconProps): JSX.Element => (
  <Svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
    <Path
      d="M14 4H20V10M20 4L13.5 10.5M10 20H4V14M4 20L10.5 13.5"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
