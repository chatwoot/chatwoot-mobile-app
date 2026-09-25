import React from 'react';

import { CallStateGlyph, type CallStateIconProps } from './Glyph';

export const PhoneIncomingIcon = ({ color, size }: CallStateIconProps) => (
  <CallStateGlyph color={color} size={size} marks="M16 2v6h6M22 2l-6 6" />
);
