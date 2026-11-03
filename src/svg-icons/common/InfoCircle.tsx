import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { IconProps } from '../../types';

// Outlined round symbols for the side toolbar on iPhone Duo. They share one circle size and
// line weight so the toolbar reads as one monochrome set (Apple HIG, Toolbars).

/** Info (circle with an "i"): conversation actions. */
export const InfoCircleIcon = ({ stroke = '#858585', strokeWidth = 2 }: IconProps): JSX.Element => {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={stroke} strokeWidth={strokeWidth} />
      <Path d="M12 11V16.5" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Circle cx="12" cy="7.75" r="1.25" fill={stroke} />
    </Svg>
  );
};

/** Check in a circle: resolve. */
export const CheckCircleIcon = ({
  stroke = '#858585',
  strokeWidth = 2,
}: IconProps): JSX.Element => {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={stroke} strokeWidth={strokeWidth} />
      <Path
        d="M8.25 12.25L10.75 14.75L15.75 9.5"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

/** Circular arrow: reopen. */
export const ReopenCircleIcon = ({
  stroke = '#858585',
  strokeWidth = 2,
}: IconProps): JSX.Element => {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
      <Path
        d="M20.25 12C20.25 16.56 16.56 20.25 12 20.25C7.44 20.25 3.75 16.56 3.75 12C3.75 7.44 7.44 3.75 12 3.75C14.6 3.75 16.9 4.95 18.4 6.83"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Path
        d="M18.75 3.5V7.25H15"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
