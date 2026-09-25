import React from 'react';
import { Path, Svg } from 'react-native-svg';

import type { GlyphProps } from './Glyph';

// The phone itself as an outline, for the audio route list
export const EarpieceOutlineGlyph = ({ color }: GlyphProps) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M7.5 3.75h9a1.5 1.5 0 0 1 1.5 1.5v13.5a1.5 1.5 0 0 1-1.5 1.5h-9a1.5 1.5 0 0 1-1.5-1.5V5.25a1.5 1.5 0 0 1 1.5-1.5z"
      stroke={color}
      strokeWidth="1.8"
    />
    <Path d="M12 17.25h.01" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
  </Svg>
);
