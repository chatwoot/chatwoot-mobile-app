import React from 'react';
import Svg, { Path } from 'react-native-svg';

export const LockIcon = () => {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 12 12" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.58579 1.58579C4.96086 1.21071 5.46957 1 6 1C6.26264 1 6.52272 1.05173 6.76537 1.15224C7.00802 1.25275 7.2285 1.40007 7.41421 1.58579C7.59993 1.7715 7.74725 1.99198 7.84776 2.23463C7.94827 2.47728 8 2.73736 8 3V5H4V3C4 2.46957 4.21071 1.96086 4.58579 1.58579ZM3 5V3C3 2.20435 3.31607 1.44129 3.87868 0.87868C4.44129 0.31607 5.20435 0 6 0C6.39397 0 6.78407 0.0775973 7.14805 0.228361C7.51203 0.379125 7.84274 0.600104 8.12132 0.87868C8.3999 1.15726 8.62087 1.48797 8.77164 1.85195C8.9224 2.21593 9 2.60603 9 3V5H9.5C10.3284 5 11 5.67157 11 6.5V10.5C11 11.3284 10.3284 12 9.5 12H2.5C1.67157 12 1 11.3284 1 10.5V6.5C1 5.67157 1.67157 5 2.5 5H3ZM8.5 6H3.5H2.5C2.22386 6 2 6.22386 2 6.5V10.5C2 10.7761 2.22386 11 2.5 11H9.5C9.77614 11 10 10.7761 10 10.5V6.5C10 6.22386 9.77614 6 9.5 6H8.5Z"
        fill="black"
        fillOpacity="0.478"
      />
    </Svg>
  );
};

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
