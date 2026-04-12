import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

import { useThemedStyles } from '@/theme';
import { IconProps } from '../../types';

export const SwitchAccountIcon = ({ stroke }: IconProps): JSX.Element => {
  const styles = useThemedStyles();
  const iconStroke = stroke || styles.iconColor;

  return (
    <Svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
      <Rect
        x="3"
        y="6"
        width="18"
        height="15"
        rx="2"
        stroke={iconStroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z"
        stroke={iconStroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8 19C8 17.3431 9.79086 16 12 16C14.2091 16 16 17.3431 16 19"
        stroke={iconStroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
