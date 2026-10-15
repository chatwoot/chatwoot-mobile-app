import React from 'react';

import { PhosphorGlyph } from '../call-controls/Glyph';
import type { CallStateIconProps } from './Glyph';

// An open ring, spun while something is in flight
export const CircleNotchIcon = ({ color, size = 20 }: CallStateIconProps) => (
  <PhosphorGlyph
    color={color}
    size={size}
    d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,176A72,72,0,0,1,92,65.64a8,8,0,0,1,8,13.85,56,56,0,1,0,56,0,8,8,0,0,1,8-13.85A72,72,0,0,1,128,200Z"
  />
);
