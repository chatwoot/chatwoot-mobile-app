import React from 'react';

import { PhosphorGlyph, type GlyphProps } from './Glyph';

// Phosphor's bold caret, pointing onwards
export const CaretRightBoldGlyph = ({ color, size }: GlyphProps) => (
  <PhosphorGlyph
    color={color}
    size={size}
    d="M184.49,136.49l-80,80a12,12,0,0,1-17-17L159,128,87.51,56.49a12,12,0,1,1,17-17l80,80A12,12,0,0,1,184.49,136.49Z"
  />
);
