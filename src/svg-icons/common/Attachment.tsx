import React from 'react';
import Svg, { Path, G, Circle, Rect } from 'react-native-svg';

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
    <Svg width="14" height="14" viewBox="0 0 24 24">
      <G fill="none" stroke="#646464" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
        <Rect width="18" height="18" x="3" y="3" rx="2" ry="2"></Rect>
        <Circle cx="9" cy="9" r="2"></Circle>
        <Path d="m21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></Path>
      </G>
    </Svg>
  );
};

export const DocumentAttachmentIcon = (): JSX.Element => {
  return (
    <Svg width="14" height="14" viewBox="0 0 24 24">
      <G fill="none" stroke="#646464" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
        <Path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></Path>
        <Path d="M14 2v4a2 2 0 0 0 2 2h4"></Path>
      </G>
    </Svg>
  );
};

export const AudioIcon = (): JSX.Element => {
  return (
    <Svg width="14" height="14" viewBox="0 0 24 24">
      <G fill="none" stroke="#646464" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
        <Path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3"></Path>
        <Path d="M19 10v2a7 7 0 0 1-14 0v-2m7 9v3"></Path>
      </G>
    </Svg>
  );
};
