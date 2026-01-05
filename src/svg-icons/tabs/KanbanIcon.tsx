import React from 'react';
import Svg, { Rect } from 'react-native-svg';

export const KanbanIconOutline = ({ color = '#171717' }: { color?: string }) => {
  return (
    <Svg width="48" height="40" viewBox="0 0 48 40" fill="none">
      {/* Grid 2x2 - layout-grid do Lucide */}
      <Rect x="6" y="3" width="10" height="10" rx="2" stroke={color} strokeWidth="1.5" />
      <Rect x="22" y="3" width="10" height="10" rx="2" stroke={color} strokeWidth="1.5" />
      <Rect x="6" y="18" width="10" height="10" rx="2" stroke={color} strokeWidth="1.5" />
      <Rect x="22" y="18" width="10" height="10" rx="2" stroke={color} strokeWidth="1.5" />
    </Svg>
  );
};

export const KanbanIconFilled = ({ color = '#171717' }: { color?: string }) => {
  return (
    <Svg width="48" height="40" viewBox="0 0 48 40" fill="none">
      {/* Grid 2x2 - layout-grid do Lucide (filled) */}
      <Rect x="6" y="3" width="10" height="10" rx="2" fill={color} />
      <Rect x="22" y="3" width="10" height="10" rx="2" fill={color} />
      <Rect x="6" y="18" width="10" height="10" rx="2" fill={color} />
      <Rect x="22" y="18" width="10" height="10" rx="2" fill={color} />
    </Svg>
  );
};
