import React from 'react';
import Svg, { ClipPath, Defs, G, Path, Rect } from 'react-native-svg';

export const ConversationIconOutline = ({ stroke = '#171717' }: { stroke?: string }) => {
  return (
    <Svg width="49" height="40" viewBox="0 0 49 40" fill="none">
      <G clipPath="url(#clip0_1_1630)">
        <Path
          d="M35 25H23.9991C17.935 25 13 20.0646 13 13.999C13 7.93537 17.935 3 23.9992 3C30.065 3 35 7.93537 35 13.999V25Z"
          stroke={stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_1_1630">
          <Rect width="24" height="24" fill="white" transform="translate(12 2)" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};

export const ConversationIconFilled = ({ fill = '#171717' }: { fill?: string }) => {
  return (
    <Svg width="49" height="40" viewBox="0 0 49 40" fill="none">
      <Path
        d="M35 25H23.9991C17.935 25 13 20.0646 13 13.999C13 7.93537 17.935 3 23.9992 3C30.065 3 35 7.93537 35 13.999V25Z"
        fill={fill}
      />
    </Svg>
  );
};
