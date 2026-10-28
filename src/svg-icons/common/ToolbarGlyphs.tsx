import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

import { IconProps } from '../../types';

// Outline glyphs for iOS toolbars (bulk actions), drawn on a 24pt grid with one line weight so
// they read as a set, like SF Symbols' tag and person.crop.circle.

/** Tag: labels. */
export const TagGlyph = ({ stroke = '#1F93FF', strokeWidth = 1.6 }: IconProps): JSX.Element => (
  <Svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
    <Path
      d="M3.75 12.06V4.75C3.75 4.2 4.2 3.75 4.75 3.75H12.06C12.33 3.75 12.58 3.86 12.77 4.04L20.1 11.37C20.49 11.76 20.49 12.4 20.1 12.79L12.79 20.1C12.4 20.49 11.76 20.49 11.37 20.1L4.04 12.77C3.86 12.58 3.75 12.33 3.75 12.06Z"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
    <Circle cx="8.25" cy="8.25" r="1.35" fill={stroke} />
  </Svg>
);

/** Person in a circle: assign. */
export const PersonCircleGlyph = ({
  stroke = '#1F93FF',
  strokeWidth = 1.6,
}: IconProps): JSX.Element => (
  <Svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={stroke} strokeWidth={strokeWidth} />
    <Circle cx="12" cy="10" r="3" stroke={stroke} strokeWidth={strokeWidth} />
    <Path
      d="M6.6 18.2C7.7 16.35 9.7 15.25 12 15.25C14.3 15.25 16.3 16.35 17.4 18.2"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </Svg>
);
