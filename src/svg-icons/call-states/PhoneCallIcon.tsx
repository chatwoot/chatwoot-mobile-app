import React from 'react';

import { CallStateGlyph, type CallStateIconProps } from './Glyph';

export const PhoneCallIcon = ({ color, size }: CallStateIconProps) => (
  <CallStateGlyph
    color={color}
    size={size}
    marks="M14.05 2a9 9 0 0 1 8 7.94M14.05 6A5 5 0 0 1 18 10"
  />
);
