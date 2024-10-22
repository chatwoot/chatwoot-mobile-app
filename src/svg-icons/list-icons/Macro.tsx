import React from 'react';
import Svg, { ClipPath, Defs, G, Path, Rect } from 'react-native-svg';

export const MacroIcon = (): JSX.Element => {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 20 20" fill="none">
      <G clipPath="url(#clip0_2165_87535)">
        <Path
          d="M8.14454 18.2661L15.127 9.26223C15.2637 9.07668 15.3418 8.91067 15.3418 8.72512C15.3418 8.37356 15.0781 8.11965 14.7168 8.11965H10.4102L12.6758 2.25051C13.0176 1.36184 12.0605 0.873557 11.4941 1.60598L4.51172 10.6099C4.375 10.7954 4.29688 10.9614 4.29688 11.147C4.29688 11.4986 4.57031 11.7525 4.92188 11.7525H9.22852L6.96289 17.6216C6.63085 18.5103 7.57812 18.9986 8.14454 18.2661ZM8.63281 15.9419L11.25 10.4536H6.47461L11.2402 4.06692L10.9961 3.9302L8.38868 9.41848H13.1543L8.38868 15.8052L8.63281 15.9419Z"
          fill="#8D8D8D"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_2165_87535">
          <Rect width="11.4062" height="17.4991" fill="white" transform="translate(4.29688 1.25)" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};
