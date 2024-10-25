import React from 'react';
import Svg, { Path } from 'react-native-svg';

import { IconProps } from '../../types';

export const ResolvedIcon = ({
  stroke = '#858585',
  strokeWidth = '1.5',
}: IconProps): JSX.Element => {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
      <Path
        d="M21.3333 11.1466V12.0053C21.3321 14.018 20.6804 15.9763 19.4753 17.5883C18.2702 19.2003 16.5764 20.3796 14.6463 20.9503C12.7162 21.5209 10.6534 21.4524 8.76546 20.7549C6.87753 20.0574 5.26564 18.7683 4.17019 17.0799C3.07474 15.3915 2.55443 13.3942 2.68686 11.3859C2.81928 9.37756 3.59735 7.46587 4.90502 5.9359C6.21269 4.40593 7.97989 3.33966 9.94307 2.8961C11.9062 2.45255 13.9602 2.65548 15.7986 3.47464M21.3333 4.53329L12 13.876L9.19996 11.076"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
