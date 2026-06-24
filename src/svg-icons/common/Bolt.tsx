import React from 'react';
import Svg, { Path } from 'react-native-svg';

import { IconProps } from '../../types';

export const Bolt = ({ stroke = '#858585', strokeWidth = 1.8 }: IconProps) => {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 16V8C21 7.28564 20.619 6.62559 20 6.268L13 2.268C12.381 1.91041 11.619 1.91041 11 2.268L4 6.268C3.38098 6.62559 3 7.28564 3 8V16C3 16.7144 3.38098 17.3744 4 17.732L11 21.732C11.619 22.0896 12.381 22.0896 13 21.732L20 17.732C20.619 17.3744 21 16.7144 21 16Z"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
