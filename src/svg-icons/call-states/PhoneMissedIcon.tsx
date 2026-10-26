import React from 'react';

import { EndGlyph } from '../call-controls/EndGlyph';
import type { CallStateIconProps } from './Glyph';

export const PhoneMissedIcon = ({ color, size = 20 }: CallStateIconProps) => (
  <EndGlyph color={color} size={size} />
);
