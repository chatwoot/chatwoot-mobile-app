import React from 'react';

import { Glyph, HANDSET_PATH, type GlyphProps } from './Glyph';

// Two bars above a handset
export const HoldGlyph = ({ color, size }: GlyphProps) => (
  <Glyph color={color} size={size} d={`M17 3h-2v7h2V3zm3 0h-2v7h2V3z${HANDSET_PATH}`} />
);
