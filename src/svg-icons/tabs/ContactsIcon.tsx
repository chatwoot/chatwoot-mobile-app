import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { IconProps } from '../../types';

export const ContactsIcon = ({ stroke = '#858585', strokeWidth = 2 }: IconProps) => {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path
        d="M16 2v2"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M7 22v-2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8 2v2"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle
        cx="12"
        cy="11"
        r="3"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Rect
        x="3"
        y="4"
        width="18"
        height="18"
        rx="2"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
