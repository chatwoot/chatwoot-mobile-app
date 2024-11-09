import React from 'react';
import Svg, { Mask, G, Rect, Defs, ClipPath } from 'react-native-svg';

export const UrgentIcon = () => {
  return (
    <Svg width="20" height="16" viewBox="0 0 20 16" fill="none">
      <G clipPath="url(#clip0_2407_49096)">
        <Mask
          id="mask0_2407_49096"
          maskType="alpha"
          maskUnits="userSpaceOnUse"
          x="0"
          y="-2"
          width="20"
          height="20">
          <Rect y="-2" width="20" height="20" fill="#ED8A5C" />
        </Mask>
        <G mask="url(#mask0_2407_49096)">
          <Rect x="3.33203" y="8" width="3.33333" height="6.66667" rx="1.66667" fill="#FFC53D" />
          <Rect x="8.33203" y="4.66602" width="3.33333" height="10" rx="1.66667" fill="#FFC53D" />
          <Rect
            x="13.332"
            y="1.33398"
            width="3.33333"
            height="13.3333"
            rx="1.66667"
            fill="#FFC53D"
          />
        </G>
      </G>
      <Defs>
        <ClipPath id="clip0_2407_49096">
          <Rect width="20" height="16" rx="8" fill="white" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};
