import React from 'react';
import Svg, { Path } from 'react-native-svg';

export const BUBBLE_TAIL_WIDTH = 6;
const BUBBLE_TAIL_HEIGHT = 12;

type BubbleTailProps = {
  color: string;
  side?: 'left' | 'right';
};

const TAIL_PATHS = {
  left: 'M6 0C6 5.5 4 9.5 0 12H6V0Z',
  right: 'M0 0C0 5.5 2 9.5 6 12H0V0Z',
};

// Curved tail drawn outside a bubble's bottom corner on the given side, pointing at the avatar.
export const BubbleTail = ({ color, side = 'left' }: BubbleTailProps) => (
  <Svg
    width={BUBBLE_TAIL_WIDTH}
    height={BUBBLE_TAIL_HEIGHT}
    viewBox={`0 0 ${BUBBLE_TAIL_WIDTH} ${BUBBLE_TAIL_HEIGHT}`}
    style={{ position: 'absolute', [side]: -BUBBLE_TAIL_WIDTH + 0.5, bottom: 0 }}
    pointerEvents="none">
    <Path d={TAIL_PATHS[side]} fill={color} />
  </Svg>
);
