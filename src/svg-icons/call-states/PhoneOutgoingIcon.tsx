import React from 'react';

import { CallStateGlyph, type CallStateIconProps } from './Glyph';

// A call the agent placed
export const PhoneOutgoingIcon = ({ color, size }: CallStateIconProps) => (
  <CallStateGlyph color={color} size={size} marks="M15 9l6-6M16 3h5v5" />
);
