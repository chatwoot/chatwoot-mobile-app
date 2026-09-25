import React from 'react';

import { CallStateGlyph, type CallStateIconProps } from './Glyph';

export const PhoneOutgoingIcon = ({ color, size }: CallStateIconProps) => (
  <CallStateGlyph color={color} size={size} marks="M22 8V2h-6M16 8l6-6" />
);
