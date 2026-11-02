import React from 'react';

import { Glyph, type GlyphProps } from './Glyph';

export const ResumeGlyph = ({ color, size }: GlyphProps) => (
  <Glyph color={color} size={size} d="M8 5v14l11-7z" />
);
