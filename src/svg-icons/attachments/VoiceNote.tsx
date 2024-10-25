import React from 'react';
import Svg, { Path } from 'react-native-svg';

import { IconProps } from '../../types';

export const VoiceNote = (props: IconProps) => {
  const { stroke = 'black', strokeOpacity = '0.565' } = props;
  return (
    <Svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 10V11C20 13.1217 19.1571 15.1566 17.6569 16.6569C16.1566 18.1571 14.1217 19 12 19M12 19C9.87827 19 7.84344 18.1571 6.34315 16.6569C4.84285 15.1566 4 13.1217 4 11V10M12 19V23M12 15C10.9391 15 9.92172 14.5786 9.17157 13.8284C8.42143 13.0783 8 12.0609 8 11V5C8 3.93913 8.42143 2.92172 9.17157 2.17157C9.92172 1.42143 10.9391 1 12 1C13.0609 1 14.0783 1.42143 14.8284 2.17157C15.5786 2.92172 16 3.93913 16 5V11C16 12.0609 15.5786 13.0783 14.8284 13.8284C14.0783 14.5786 13.0609 15 12 15Z"
        stroke={stroke}
        strokeOpacity={strokeOpacity}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
