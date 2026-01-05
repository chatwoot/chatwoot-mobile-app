import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

interface MoveToInboxProps {
  color?: string;
  size?: number;
}

export const MoveToInbox: React.FC<MoveToInboxProps> = ({ color = '#6B7280', size = 28 }) => (
  <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
    <Path
      d="M2 6h22v16H2z"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M2 6l10 9 10-9"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M23 14h4m0 0l-2-2m2 2l-2 2"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
