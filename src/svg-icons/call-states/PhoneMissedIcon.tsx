import React from 'react';

import { EndGlyph } from '../call-controls/EndGlyph';
import type { CallStateIconProps } from './Glyph';

// A call nobody picked up, drawn as the hung-up handset
export const PhoneMissedIcon = ({ color, size = 20 }: CallStateIconProps) => (
  <EndGlyph color={color} size={size} />
);
