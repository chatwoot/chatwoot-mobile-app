import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface ThemeIconProps {
  color?: string;
  size?: number;
}

export const ThemeIcon: React.FC<ThemeIconProps> = ({ 
  color = '#6B7280', 
  size = 20 
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Sun rays */}
      <Path
        d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Sun/Moon circle */}
      <Path
        d="M12 7C9.24 7 7 9.24 7 12C7 14.76 9.24 17 12 17C14.76 17 17 14.76 17 12C17 9.24 14.76 7 12 7Z"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />
      {/* Moon crescent overlay */}
      <Path
        d="M12 7C10.34 7 8.93 7.83 8.13 9.13C7.33 10.43 7.33 12.07 8.13 13.37C8.93 14.67 10.34 15.5 12 15.5"
        fill={color}
        opacity="0.3"
      />
    </Svg>
  );
};
