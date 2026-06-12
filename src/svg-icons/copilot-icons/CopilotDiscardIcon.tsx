import React from 'react';
import { ClipPath, Defs, G, Path, Rect, Svg } from 'react-native-svg';

export const CopilotDiscardIcon = (): JSX.Element => {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 28 28" fill="none">
      <G clipPath="url(#clip0)">
        <Path
          d="M19 9L9 19"
          stroke="#60646C"
          strokeWidth="1.66667"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M9 9L19 19"
          stroke="#60646C"
          strokeWidth="1.66667"
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
