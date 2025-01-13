import React from 'react';
import Svg, { G, Mask, Rect } from 'react-native-svg';

export const NoPriorityIcon = () => {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Mask id="mask0_3248_52021" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
        <Rect width="24" height="24" fill="#D9D9D9" />
      </Mask>
      <G mask="url(#mask0_3248_52021)">
        <Rect x="4" y="12" width="4" height="8" rx="2" fill="#DDDDE3" />
        <Rect x="10" y="8" width="4" height="12" rx="2" fill="#DDDDE3" />
        <Rect x="16" y="4" width="4" height="16" rx="2" fill="#DDDDE3" />
      </G>
    </Svg>
  );
};
