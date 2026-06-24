import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

export const ApiFilledIcon = () => {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 20 20" fill="none">
      <Circle cx="10" cy="10" r="10" fill="#BBBBBB" />
      <Path
        d="M8.2 5.6H7.8C6.9 5.6 6.4 6.1 6.4 7v1.4C6.4 9.1 6 9.6 5.3 9.8C6 10 6.4 10.5 6.4 11.2V13C6.4 13.9 6.9 14.4 7.8 14.4H8.2"
        stroke="white"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M11.8 5.6H12.2C13.1 5.6 13.6 6.1 13.6 7V8.4C13.6 9.1 14 9.6 14.7 9.8C14 10 13.6 10.5 13.6 11.2V13C13.6 13.9 13.1 14.4 12.2 14.4H11.8"
        stroke="white"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
