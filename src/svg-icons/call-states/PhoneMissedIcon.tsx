import React from 'react';

import { CallStateGlyph, type CallStateIconProps } from './Glyph';

export const PhoneMissedIcon = ({ color, size }: CallStateIconProps) => (
  <CallStateGlyph color={color} size={size} marks="M22 2l-6 6M16 2l6 6" />
);
