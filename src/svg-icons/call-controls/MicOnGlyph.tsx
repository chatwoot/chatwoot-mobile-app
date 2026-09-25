import React from 'react';

import { Glyph, type GlyphProps } from './Glyph';

export const MicOnGlyph = ({ color, size }: GlyphProps) => (
  <Glyph
    color={color}
    size={size}
    d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"
  />
);
