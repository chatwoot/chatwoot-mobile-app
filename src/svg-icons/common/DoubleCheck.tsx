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

export const MessagePendingIcon = ({ stroke = '#858585' }: IconProps): JSX.Element => {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 14 15" fill="none">
      <Path
        d="M7 4.5V7.5L9 8.5M12 7.5C12 10.2614 9.76142 12.5 7 12.5C4.23858 12.5 2 10.2614 2 7.5C2 4.73858 4.23858 2.5 7 2.5C9.76142 2.5 12 4.73858 12 7.5Z"
        stroke={stroke}
        strokeOpacity="0.662"
        strokeWidth="0.857143"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
