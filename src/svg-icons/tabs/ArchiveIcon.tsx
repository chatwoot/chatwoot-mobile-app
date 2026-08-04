import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

export const ArchiveIconOutline = () => {
  return (
    <Svg width="48" height="40" viewBox="0 0 48 40" fill="none">
      <Rect
        x="13"
        y="9"
        width="22"
        height="6"
        rx="1.5"
        stroke="#171717"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <Path
        d="M15 15V27C15 28.1046 15.8954 29 17 29H31C32.1046 29 33 28.1046 33 27V15"
        stroke="#171717"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M21 21H27" stroke="#171717" strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
};

export const ArchiveIconFilled = () => {
  return (
    <Svg width="48" height="40" viewBox="0 0 48 40" fill="none">
      <Rect x="13" y="9" width="22" height="6" rx="1.5" fill="#171717" />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15 17H33V27C33 28.1046 32.1046 29 31 29H17C15.8954 29 15 28.1046 15 27V17ZM21 20.25C20.5858 20.25 20.25 20.5858 20.25 21C20.25 21.4142 20.5858 21.75 21 21.75H27C27.4142 21.75 27.75 21.4142 27.75 21C27.75 20.5858 27.4142 20.25 27 20.25H21Z"
        fill="#171717"
      />
    </Svg>
  );
};
