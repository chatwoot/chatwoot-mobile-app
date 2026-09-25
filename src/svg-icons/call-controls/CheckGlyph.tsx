import React from 'react';
import { Path, Svg } from 'react-native-svg';

import type { GlyphProps } from './Glyph';

export const CheckGlyph = ({ color }: GlyphProps) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 12.5l4.5 4.5L19 7.5"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
