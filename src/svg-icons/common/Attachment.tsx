import React from 'react';
import { Path, Svg } from 'react-native-svg';

import { IconProps } from '../../types';

export const AttachmentIcon = ({ stroke = 'black' }: IconProps): JSX.Element => {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
      <Path
        d="M13.7527 7.74731L6.5 15C5.27036 16.2296 5.27036 18.8463 6.5 20.0778C7.72964 21.3074 10.5155 21.3074 11.7469 20.0778L19.0671 12.7575C21.5282 10.2965 21.5282 6.30689 19.0671 3.84581C16.6061 1.38473 12.6165 1.38473 10.1554 3.84581L3.5 10"
        stroke={stroke}
        strokeOpacity="0.565"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
