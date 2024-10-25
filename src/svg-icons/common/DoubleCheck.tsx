import React from 'react';
import { Path, Svg } from 'react-native-svg';

import { IconProps } from '../../types';

type DoubleCheckIconProps = IconProps & {
  renderSecondTick?: boolean;
};

export const DoubleCheckIcon = ({
  stroke = '#858585',
  renderSecondTick = true,
}: DoubleCheckIconProps): JSX.Element => {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
      <Path
        d="M16 5L4.92045 18L1 12.0909"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {renderSecondTick ? (
        <Path
          d="M23 5L12 18"
          stroke={stroke}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : null}
    </Svg>
  );
};
