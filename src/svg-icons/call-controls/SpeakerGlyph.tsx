import React from 'react';

import { Glyph, type GlyphProps } from './Glyph';

export const SpeakerGlyph = ({ color, size }: GlyphProps) => (
  <Glyph
    color={color}
    size={size}
    d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05A4.49 4.49 0 0 0 16.5 12zM14 3.23v2.06a7 7 0 0 1 0 13.42v2.06a9 9 0 0 0 0-17.54z"
  />
);
