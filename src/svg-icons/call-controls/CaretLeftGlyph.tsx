import React from 'react';

import { PhosphorGlyph, type GlyphProps } from './Glyph';

// Phosphor's bold caret, pointing back
export const CaretLeftGlyph = ({ color, size }: GlyphProps) => (
  <PhosphorGlyph
    color={color}
    size={size}
    d="M168.49,199.51a12,12,0,0,1-17,17l-80-80a12,12,0,0,1,0-17l80-80a12,12,0,0,1,17,17L97,128Z"
  />
);
