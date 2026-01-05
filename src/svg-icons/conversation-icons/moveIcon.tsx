import React from 'react';
import Svg, { Path } from 'react-native-svg';

export const MoveIcon = ({ color = 'currentColor', strokeWidth = 2 }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M7 20V4M7 4L3 8M7 4L11 8M17 4V20M17 20L13 16M17 20L21 16"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
