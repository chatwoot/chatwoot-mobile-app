import React from 'react';

import { CallStateGlyph, type CallStateIconProps } from './Glyph';

export const PhoneCallIcon = ({ color, size }: CallStateIconProps) => (
  <CallStateGlyph
    color={color}
    size={size}
    marks="M14.5 2.5a7 7 0 0 1 7 7M14.5 6.5a3 3 0 0 1 3 3"
  />
);
