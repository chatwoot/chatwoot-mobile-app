import React from 'react';
import { Path, Svg } from 'react-native-svg';

import { HANDSET_PATH } from '../call-controls/Glyph';

export type CallStateIconProps = { color: string; size?: number };

// The filled handset with stroked marks beside it that say which way the call went
export const CallStateGlyph = ({
  color,
  size = 20,
  marks,
}: CallStateIconProps & { marks: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d={HANDSET_PATH} fill={color} />
    <Path d={marks} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
