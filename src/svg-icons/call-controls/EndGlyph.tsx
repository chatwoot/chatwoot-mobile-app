import React from 'react';

import { Glyph, type GlyphProps } from './Glyph';

export const EndGlyph = ({ color, size }: GlyphProps) => (
  <Glyph
    color={color}
    size={size}
    d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85a1 1 0 0 1-1.41-.01L.29 13.08a1 1 0 0 1 0-1.41C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67a1 1 0 0 1 0 1.42l-2.48 2.48a1 1 0 0 1-1.41.01c-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"
  />
);
