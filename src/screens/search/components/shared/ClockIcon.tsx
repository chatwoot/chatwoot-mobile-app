import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

import type { IconProps } from '@/types';

// Recent search rows (iOS) lead with a clock, like the system search history.
export const ClockIcon = ({ stroke = '#8D8D8D' }: IconProps) => (
  <Svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={stroke} strokeWidth="1.5" />
    <Path
      d="M12 7.5V12L15 14"
      stroke={stroke}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
