import React from 'react';
import { Path, Svg } from 'react-native-svg';

export type GlyphProps = { color: string; size?: number };

// A filled glyph on a 24pt grid, scaled to the requested size
export const Glyph = ({ d, color, size = 24 }: GlyphProps & { d: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d={d} fill={color} />
  </Svg>
);

export const HANDSET_PATH =
  'M20 15.5c-1.25 0-2.45-.2-3.57-.57a1 1 0 0 0-1.02.24l-2.2 2.2a15.05 15.05 0 0 1-6.59-6.59l2.2-2.21a1 1 0 0 0 .25-1A11.36 11.36 0 0 1 8.5 4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1c0 9.39 7.61 17 17 17a1 1 0 0 0 1-1v-3.5a1 1 0 0 0-1-1z';
