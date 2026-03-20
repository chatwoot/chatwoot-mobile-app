import React from 'react';
import { Path, Svg } from 'react-native-svg';

import { IconProps } from '../../types';

export const SuggestReplyIcon = ({ stroke = '#171717' }: IconProps): JSX.Element => {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 20 20" fill="none">
      <Path
        d="M17.5 9.583a6.26 6.26 0 0 1-.675 2.842 6.333 6.333 0 0 1-5.658 3.492 6.26 6.26 0 0 1-2.842-.675L2.5 17.5l2.258-5.825a6.26 6.26 0 0 1-.675-2.842A6.333 6.333 0 0 1 7.575 3.175a6.26 6.26 0 0 1 2.842-.675h.375a6.317 6.317 0 0 1 5.958 5.958v.125Z"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
