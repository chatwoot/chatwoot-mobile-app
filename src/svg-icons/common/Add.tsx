import React from 'react';
import { Path, Svg } from 'react-native-svg';

import { IconProps } from '../../types';
import { tailwind } from '@/theme';

export const AddIcon = ({
  stroke = tailwind.color('text-black dark:text-grayDark-950'),
}: IconProps): JSX.Element => {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3L12 21M21 12L3 12"
        stroke={stroke}
        strokeOpacity="0.565"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
