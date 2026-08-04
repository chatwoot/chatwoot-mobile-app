import React from 'react';
import Svg, { Path } from 'react-native-svg';

const FUNNEL_PATH = 'M13.5 9.33337H34.5L26.6667 18.6667V26L21.3333 28.6667V18.6667L13.5 9.33337Z';

export const FunnelIconOutline = () => {
  return (
    <Svg width="48" height="40" viewBox="0 0 48 40" fill="none">
      <Path
        d={FUNNEL_PATH}
        stroke="#171717"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export const FunnelIconFilled = () => {
  return (
    <Svg width="48" height="40" viewBox="0 0 48 40" fill="none">
      <Path d={FUNNEL_PATH} fill="#171717" />
    </Svg>
  );
};
