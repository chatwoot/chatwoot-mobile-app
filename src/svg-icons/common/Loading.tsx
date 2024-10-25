import React from 'react';
import Svg, { Path } from 'react-native-svg';

import { IconProps } from '../../types';

export const LoadingIcon = ({ stroke = '#858585' }: IconProps): JSX.Element => {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2V6M12 18V22M6 12H2M22 12H18M19.0784 19.0784L16.25 16.25M19.0784 4.99994L16.25 7.82837M4.92157 19.0784L7.75 16.25M4.92157 4.99994L7.75 7.82837"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
