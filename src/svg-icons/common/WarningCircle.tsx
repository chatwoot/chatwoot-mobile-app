import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

import { tailwind } from '@/theme';
import type { IconProps } from '@/types';

export const WarningCircleIcon = ({
  fill = tailwind.color('text-ruby-900'),
}: IconProps): JSX.Element => {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" fill={fill} />
      <Path
        d="M12 7V13"
        stroke={tailwind.color('text-white')}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Circle cx="12" cy="16.5" r="1.25" fill={tailwind.color('text-white')} />
    </Svg>
  );
};
