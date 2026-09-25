import React from 'react';

import { Glyph, HANDSET_PATH, type GlyphProps } from './Glyph';

// A play triangle above a handset
export const ResumeGlyph = ({ color, size }: GlyphProps) => (
  <Glyph color={color} size={size} d={`M15 3v8l6.5-4L15 3z${HANDSET_PATH}`} />
);
