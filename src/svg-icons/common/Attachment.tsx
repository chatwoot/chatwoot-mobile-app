import React from 'react';
import { Path, Svg } from 'react-native-svg';

import { IconProps } from '../../types';

export const AttachmentIcon = ({ stroke = 'black' }: IconProps): JSX.Element => {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
      <Path
        d="M13.7527 7.74731L6.5 15C5.27036 16.2296 5.27036 18.8463 6.5 20.0778C7.72964 21.3074 10.5155 21.3074 11.7469 20.0778L19.0671 12.7575C21.5282 10.2965 21.5282 6.30689 19.0671 3.84581C16.6061 1.38473 12.6165 1.38473 10.1554 3.84581L3.5 10"
        stroke={stroke}
        strokeOpacity="0.565"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
export const ImageAttachmentIcon = (): JSX.Element => {
  return (
    <Svg width="17" height="16" viewBox="0 0 17 16" fill="none">
      <Path
        d="M14.332 10L12.2747 7.94267C12.0247 7.69271 11.6856 7.55229 11.332 7.55229C10.9785 7.55229 10.6394 7.69271 10.3894 7.94267L4.33203 14M3.66536 2H12.9987C13.7351 2 14.332 2.59695 14.332 3.33333V12.6667C14.332 13.403 13.7351 14 12.9987 14H3.66536C2.92898 14 2.33203 13.403 2.33203 12.6667V3.33333C2.33203 2.59695 2.92898 2 3.66536 2ZM7.66536 6C7.66536 6.73638 7.06841 7.33333 6.33203 7.33333C5.59565 7.33333 4.9987 6.73638 4.9987 6C4.9987 5.26362 5.59565 4.66667 6.33203 4.66667C7.06841 4.66667 7.66536 5.26362 7.66536 6Z"
        stroke="#8D8D8D"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export const DocumentAttachmentIcon = (): JSX.Element => {
  return (
    <Svg width="17" height="16" viewBox="0 0 17 16" fill="none">
      <Path
        d="M9.4987 1.33301V3.99967C9.4987 4.3533 9.63917 4.69243 9.88922 4.94248C10.1393 5.19253 10.4784 5.33301 10.832 5.33301H13.4987M10.1654 1.33301H4.16536C3.81174 1.33301 3.4726 1.47348 3.22256 1.72353C2.97251 1.97358 2.83203 2.31272 2.83203 2.66634V13.333C2.83203 13.6866 2.97251 14.0258 3.22256 14.2758C3.4726 14.5259 3.81174 14.6663 4.16536 14.6663H12.1654C12.519 14.6663 12.8581 14.5259 13.1082 14.2758C13.3582 14.0258 13.4987 13.6866 13.4987 13.333V4.66634L10.1654 1.33301Z"
        stroke="#8D8D8D"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export const AudioIcon = (): JSX.Element => {
  return (
    <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <Path
        d="M12.6654 6.66634V7.99967C12.6654 9.23735 12.1737 10.4243 11.2985 11.2995C10.4234 12.1747 9.23637 12.6663 7.9987 12.6663M7.9987 12.6663C6.76102 12.6663 5.57404 12.1747 4.69887 11.2995C3.8237 10.4243 3.33203 9.23735 3.33203 7.99967V6.66634M7.9987 12.6663V14.6663M7.9987 1.33301C7.46826 1.33301 6.95956 1.54372 6.58448 1.91879C6.20941 2.29387 5.9987 2.80257 5.9987 3.33301V7.99967C5.9987 8.53011 6.20941 9.03882 6.58448 9.41389C6.95956 9.78896 7.46826 9.99967 7.9987 9.99967C8.52913 9.99967 9.03784 9.78896 9.41291 9.41389C9.78798 9.03882 9.9987 8.53011 9.9987 7.99967V3.33301C9.9987 2.80257 9.78798 2.29387 9.41291 1.91879C9.03784 1.54372 8.52913 1.33301 7.9987 1.33301Z"
        stroke="#8D8D8D"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
