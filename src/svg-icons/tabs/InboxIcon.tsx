import React from 'react';
import Svg, { Path, Polyline } from 'react-native-svg';

import { IconProps } from '../../types';

export const InboxIconOutline = ({ stroke = '#858585', strokeWidth = 2 }: IconProps) => {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Polyline
        points="22 12 16 12 14 15 10 15 8 12 2 12"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export const InboxIconFilled = (props: IconProps) => <InboxIconOutline {...props} />;
