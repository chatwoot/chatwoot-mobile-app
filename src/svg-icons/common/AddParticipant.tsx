import React from 'react';
import { Path, Svg } from 'react-native-svg';

import { IconProps } from '../../types';

export const AddParticipant = ({
  stroke = '#858585',
  strokeWidth = 1.5,
}: IconProps): JSX.Element => {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
      <Path
        d="M12.0001 2.57886C6.80649 2.57886 2.59619 6.78915 2.59619 11.9828C2.59619 17.1765 6.80649 21.3868 12.0001 21.3868C17.1938 21.3868 21.4041 17.1765 21.4041 11.9828C21.4041 10.8451 21.2021 9.75452 20.8319 8.74508"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M14.888 10.617C14.888 12.2124 13.5947 13.5057 11.9993 13.5057C10.4039 13.5057 9.1106 12.2124 9.1106 10.617C9.1106 9.02159 10.4039 7.72827 11.9993 7.72827C13.5947 7.72827 14.888 9.02159 14.888 10.617Z"
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      <Path
        d="M17.618 1.57202V4.41846M17.618 4.41846V7.26491M17.618 4.41846H14.7716M17.618 4.41846H20.4645"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M6.92198 18.252C7.33467 17.0342 8.47748 16.2148 9.76326 16.2148H14.2376C15.5238 16.2148 16.6669 17.0348 17.0792 18.2531L17.1639 18.5032C17.4285 19.2852 17.0115 20.1341 16.2308 20.4026L14.6021 20.9627C12.9164 21.5424 11.0853 21.5425 9.39955 20.9629L7.76997 20.4027C6.98897 20.1342 6.57193 19.2849 6.837 18.5027L6.92198 18.252Z"
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
};
