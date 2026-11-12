import React from 'react';

import { Glyph, type GlyphProps } from './Glyph';

export const HoldGlyph = ({ color, size }: GlyphProps) => (
  <Glyph color={color} size={size} d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
);
