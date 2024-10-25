import React from 'react';
import Svg, { Path } from 'react-native-svg';

import { IconProps } from '../../types';

export const MuteIcon = ({ stroke = '#858585', strokeWidth = '1.5' }: IconProps): JSX.Element => {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
      <Path
        d="M18.5 11.5V16.1002C18.5 18.16 18.5 19.19 18.0747 19.7331C17.7046 20.2058 17.1418 20.4872 16.5416 20.4997C15.8519 20.514 15.028 19.8961 13.3801 18.6603L12.313 17.86"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M10 16.5H6.7C5.5799 16.5 5.01984 16.5 4.59202 16.282C4.21569 16.0903 3.90973 15.7843 3.71799 15.408C3.5 14.9802 3.5 14.4201 3.5 13.3V11.7C3.5 10.5799 3.5 10.0198 3.71799 9.59202C3.90973 9.21569 4.21569 8.90973 4.59202 8.71799C5.01984 8.5 5.57989 8.5 6.7 8.5H10L14.8236 5.09507C15.2713 4.7791 15.4951 4.62111 15.66 4.54478C16.8463 3.99581 18.2317 4.71366 18.4672 5.99936C18.5 6.17811 18.5 6.45208 18.5 7V7"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M22 3L6 21.5"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
