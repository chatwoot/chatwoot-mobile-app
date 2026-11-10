import React from 'react';

import { Glyph, HANDSET_PATH, type GlyphProps } from './Glyph';

export const AnswerGlyph = ({ color, size }: GlyphProps) => (
  <Glyph color={color} size={size} d={HANDSET_PATH} />
);
