import React from 'react';
import Svg, { Mask, G, Rect } from 'react-native-svg';

export const HighIcon = () => {
  return (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <Mask
        id="mask0_2323_83934"
        maskType="alpha"
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="24"
        height="24">
        <Rect width="24" height="24" fill="#ED8A5C" />
      </Mask>
      <G mask="url(#mask0_2323_83934)">
        <Rect x="4" y="12" width="4" height="8" rx="2" fill="#FFC53D" />
        <Rect x="10" y="8" width="4" height="12" rx="2" fill="#FFC53D" />
        <Rect x="16" y="4" width="4" height="16" rx="2" fill="#FFC53D" />
      </G>
    </Svg>
  );
};
