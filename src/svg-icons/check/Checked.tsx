import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

export const CheckedIcon = () => {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 20 20" fill="none">
      <Circle cx="10" cy="10" r="10" fill="#0081F1" />
      <Path
        d="M6 11L8.83306 13.8331C8.92045 13.9204 9.06539 13.9085 9.13723 13.8079L14 7"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
};
