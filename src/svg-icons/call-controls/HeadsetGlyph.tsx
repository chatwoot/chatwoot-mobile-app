import React from 'react';

import { Glyph, type GlyphProps } from './Glyph';

export const HeadsetGlyph = ({ color, size }: GlyphProps) => (
  <Glyph
    color={color}
    size={size}
    d="M12 1a9 9 0 0 0-9 9v7a3 3 0 0 0 3 3h3v-8H5v-2a7 7 0 0 1 14 0v2h-4v8h3a3 3 0 0 0 3-3v-7a9 9 0 0 0-9-9z"
  />
);
