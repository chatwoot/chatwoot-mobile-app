import { BrandTokens } from '@/theme';
import React from 'react';
import { Circle, Path, Svg } from 'react-native-svg';

export interface IconProps {
  size?: number;
  color?: string;
}

export const NotchatIcon = ({ 
  size = 24, 
  color = BrandTokens.colors.primary 
}: IconProps): JSX.Element => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" fill={color} />
      <Path
        d="M16 16.5H11.5C8.46243 16.5 6 14.0376 6 11C6 7.96243 8.46243 5.5 11.5 5.5C14.5376 5.5 17 7.96243 17 11V16.5Z"
        fill="white"  
      />
    </Svg>
  );
};
