import React from 'react';
import Svg, { G, Path, Rect } from 'react-native-svg';

export const PrivateNoteIcon = () => {
  return (
    <Svg width="14" height="14" viewBox="0 0 24 24">
      <G fill="none" stroke="#646464" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
        <Rect width="18" height="11" x="3" y="11" rx="2" ry="2"></Rect>
        <Path d="M7 11V7a5 5 0 0 1 10 0v4"></Path>
      </G>
    </Svg>
  );
};
export const OutgoingIcon = () => {
  return (
    <Svg width="14" height="16" viewBox="0 0 24 24">
      <G fill="none" stroke="#646464" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
        <Path d="M9 14L4 9l5-5"></Path>
        <Path d="M20 20v-7a4 4 0 0 0-4-4H4"></Path>
      </G>
    </Svg>
  );
};
