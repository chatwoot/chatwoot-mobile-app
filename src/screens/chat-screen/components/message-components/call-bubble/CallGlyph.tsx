import React from 'react';
import { Path, Svg } from 'react-native-svg';

type CallGlyphProps = { color: string; failed: boolean; outbound: boolean };

const HANDSET =
  'M16.57 21.27c1.68 0 2.73-.43 3.66-1.51.08-.08.16-.18.24-.27.55-.62.81-1.23.81-1.82 0-.69-.42-1.38-1.3-1.99l-2.33-1.6c-.74-.51-1.35-.52-2.27-.08l-1.42.69c-.25.13-.48.13-.71-.03-.4-.26-1.48-1.14-2.1-1.76-.62-.62-1.31-1.45-1.63-2-.1-.19-.09-.35.07-.6l.81-1.28c.36-.56.5-1.4 0-2.11L8.57 4.3C7.96 3.42 7.3 3.01 6.6 3c-.59-.01-1.2.26-1.82.81-.09.07-.17.15-.27.23C3.45 4.98 3 6.02 3 7.7c0 2.66 1.59 5.92 4.63 8.95 3.01 3.01 6.28 4.62 8.94 4.62Z';

// Handset with an arrow (in/out) or a cross (missed), so the state reads without text
export const CallGlyph = ({ color, failed, outbound }: CallGlyphProps) => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path d={HANDSET} fill={color} />
    {failed ? (
      <Path d="M15 4l5 5M20 4l-5 5" stroke={color} strokeWidth="2" strokeLinecap="round" />
    ) : (
      <Path
        d={outbound ? 'M15 9l5-5M20 8V4h-4' : 'M20 4l-5 5M15 5v4h4'}
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    )}
  </Svg>
);
