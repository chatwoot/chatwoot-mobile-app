import React from 'react';
import { Circle, Rect, Svg } from 'react-native-svg';

// [conomni] m2: ConOmni brand sign, ported from
// conomni-chatwoot/public/brand-assets/logo_thumbnail.svg (V2 «Теал» #12A594).
export const ConomniIcon = (): JSX.Element => {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 16 16" fill="none">
      <Rect width="16" height="16" rx="3.6" fill="#12A594" />
      <Circle cx="6.4" cy="8" r="3.1" fill="none" stroke="#ffffff" strokeWidth="1.4" />
      <Circle
        cx="9.6"
        cy="8"
        r="3.1"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.4"
        strokeOpacity="0.72"
      />
    </Svg>
  );
};
