import React from 'react';
import { Circle, ClipPath, Defs, G, Path, Rect, Svg } from 'react-native-svg';

export const CopilotAcceptIcon = (): JSX.Element => {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 28 28" fill="none">
      <G clipPath="url(#clip0)">
        <Circle cx="14" cy="14" r="14" fill="#0D9B8A" />
        <Path
          d="M20 9.5L11.75 17.75L8 14"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
      <Defs>
        <ClipPath id="clip0">
          <Rect width="28" height="28" fill="white" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};
