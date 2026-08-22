import React from 'react';
import Svg, { Line, Path, Polyline } from 'react-native-svg';

export const ChannelsIconOutline = () => {
  return (
    <Svg width="48" height="40" viewBox="0 0 24 24" fill="none">
      <Path
        d="M22 17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.5C2 7 4 5 6.5 5H18c2.2 0 4 1.8 4 4v8Z"
        stroke="#171717"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Polyline
        points="15 9 18 9 18 11"
        stroke="#171717"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M6.5 5C9 5 11 7 11 9.5V17a2 2 0 0 1-2 2"
        stroke="#171717"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Line
        x1="6"
        x2="7"
        y1="10"
        y2="10"
        stroke="#171717"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export const ChannelsIconFilled = () => {
  return (
    <Svg width="48" height="40" viewBox="0 0 24 24" fill="none">
      <Path
        d="M22 17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.5C2 7 4 5 6.5 5H18c2.2 0 4 1.8 4 4v8Z"
        stroke="#171717"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Polyline
        points="15 9 18 9 18 11"
        stroke="#171717"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M6.5 5C9 5 11 7 11 9.5V17a2 2 0 0 1-2 2"
        stroke="#171717"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Line
        x1="6"
        x2="7"
        y1="10"
        y2="10"
        stroke="#171717"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
