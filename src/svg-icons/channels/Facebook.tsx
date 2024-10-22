import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

export const FacebookIcon = () => {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 20 20" fill="none">
      <Circle cx="10" cy="10" r="10" fill="white" />
      <Path
        d="M20 10C20 4.48 15.52 0 10 0C4.48 0 0 4.48 0 10C0 14.84 3.44 18.87 8 19.8V13H6V10H8V7.5C8 5.57 9.57 4 11.5 4H14V7H12C11.45 7 11 7.45 11 8V10H14V13H11V19.95C16.05 19.45 20 15.19 20 10Z"
        fill="#408EEB"
      />
    </Svg>
  );
};
