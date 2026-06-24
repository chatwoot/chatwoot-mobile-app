import React from 'react';
import Svg, { Path } from 'react-native-svg';

import { IconProps } from '../../types';

export const ConversationIconOutline = ({ stroke = '#858585', strokeWidth = 1.5 }: IconProps) => {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 20.5H11.9993C7.03775 20.5 3 16.462 3 11.4992C3 6.53803 7.03775 2.5 11.9994 2.5C16.9622 2.5 21 6.53803 21 11.4992V20.5Z"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export const ConversationIconFilled = ({ fill = '#171717' }: IconProps) => {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 20.5H11.9993C7.03775 20.5 3 16.462 3 11.4992C3 6.53803 7.03775 2.5 11.9994 2.5C16.9622 2.5 21 6.53803 21 11.4992V20.5Z"
        fill={fill}
      />
    </Svg>
  );
};
