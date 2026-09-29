import React from 'react';

import { Glyph, type GlyphProps } from './Glyph';

// A tick marking the chosen item
export const CheckGlyph = ({ color, size }: GlyphProps) => (
  <Glyph color={color} size={size} d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
);
