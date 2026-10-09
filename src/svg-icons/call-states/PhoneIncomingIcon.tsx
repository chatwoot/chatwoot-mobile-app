import React from 'react';

import { CallStateGlyph, type CallStateIconProps } from './Glyph';

// A call that came in
export const PhoneIncomingIcon = ({ color, size }: CallStateIconProps) => (
  <CallStateGlyph color={color} size={size} marks="M21 3l-6 6M15 4v5h5" />
);
