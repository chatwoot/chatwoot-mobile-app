import React from 'react';

import { AnswerGlyph } from '../call-controls/AnswerGlyph';
import type { CallStateIconProps } from './Glyph';

export const HandsetIcon = ({ color, size = 20 }: CallStateIconProps) => (
  <AnswerGlyph color={color} size={size} />
);
