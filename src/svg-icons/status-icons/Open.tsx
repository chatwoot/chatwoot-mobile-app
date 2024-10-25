import React from 'react';
import Svg, { Path } from 'react-native-svg';

import { IconProps } from '../../types';

export const OpenIcon = ({ stroke = '#858585', strokeWidth = '1.5' }: IconProps): JSX.Element => {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
      <Path
        d="M21.2746 12.9803C20.9698 15.8456 19.3473 18.5306 16.6626 20.0815C12.202 22.6584 6.49829 21.1292 3.92298 16.666L3.64868 16.1906M2.7248 11.0196C3.0296 8.15435 4.6521 5.46936 7.33688 3.91838C11.7974 1.34154 17.5012 2.87075 20.0765 7.33397L20.3508 7.80934M2.66669 18.6594L3.46988 15.6601L6.46743 16.4638M17.5326 7.53616L20.5302 8.33983L21.3334 5.3405"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
