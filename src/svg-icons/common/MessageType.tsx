import React from 'react';
import Svg, { Path } from 'react-native-svg';

export const PrivateNoteIcon = () => {
  return (
    <Svg width="17" height="17" viewBox="0 0 16 16" fill="none">
      <Path
        d="M4.66667 7.33301V4.66634C4.66667 3.78229 5.01786 2.93444 5.64298 2.30932C6.2681 1.6842 7.11595 1.33301 8 1.33301C8.88406 1.33301 9.7319 1.6842 10.357 2.30932C10.9821 2.93444 11.3333 3.78229 11.3333 4.66634V7.33301M3.33333 7.33301H12.6667C13.403 7.33301 14 7.92996 14 8.66634V13.333C14 14.0694 13.403 14.6663 12.6667 14.6663H3.33333C2.59695 14.6663 2 14.0694 2 13.333V8.66634C2 7.92996 2.59695 7.33301 3.33333 7.33301Z"
        stroke="#8D8D8D"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export const OutgoingIcon = () => {
  return (
    <Svg width="16" height="16" viewBox="0 0 20 20" fill="none">
      <Path
        d="M7.50065 11.6663L3.33398 7.49967M3.33398 7.49967L7.50065 3.33301M3.33398 7.49967H13.334C14.218 7.49967 15.0659 7.85086 15.691 8.47598C16.3161 9.10111 16.6673 9.94895 16.6673 10.833V16.6663"
        stroke="#646464"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
