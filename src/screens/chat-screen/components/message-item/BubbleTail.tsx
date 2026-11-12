import React from 'react';
import Svg, { Path } from 'react-native-svg';

export const BUBBLE_TAIL_WIDTH = 6;
const BUBBLE_TAIL_HEIGHT = 12;

type BubbleTailProps = {
  color: string;
};

// Curved tail drawn to the left of a bubble's bottom-left corner, pointing at the avatar.
export const BubbleTail = ({ color }: BubbleTailProps) => (
  <Svg
    width={BUBBLE_TAIL_WIDTH}
    height={BUBBLE_TAIL_HEIGHT}
    viewBox={`0 0 ${BUBBLE_TAIL_WIDTH} ${BUBBLE_TAIL_HEIGHT}`}
    style={{ position: 'absolute', left: -BUBBLE_TAIL_WIDTH + 0.5, bottom: 0 }}
    pointerEvents="none">
    <Path d="M6 0C6 5.5 4 9.5 0 12H6V0Z" fill={color} />
  </Svg>
);
