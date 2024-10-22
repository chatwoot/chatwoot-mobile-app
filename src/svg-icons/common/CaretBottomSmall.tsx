import React from 'react';
import { Path, Svg } from 'react-native-svg';

import { IconProps } from '../../types';

export const CaretBottomSmall = ({ fill = '#303030' }: IconProps): JSX.Element => {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 8 5" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0.21967 0.21967C0.512563 -0.0732236 0.987437 -0.0732236 1.28033 0.21967L3.75 2.68934L6.21967 0.21967C6.51256 -0.0732233 6.98744 -0.0732233 7.28033 0.21967C7.57322 0.512563 7.57322 0.987437 7.28033 1.28033L4.28033 4.28033C3.98744 4.57322 3.51256 4.57322 3.21967 4.28033L0.21967 1.28033C-0.0732236 0.987437 -0.0732236 0.512563 0.21967 0.21967Z"
        fill={fill}
      />
    </Svg>
  );
};
