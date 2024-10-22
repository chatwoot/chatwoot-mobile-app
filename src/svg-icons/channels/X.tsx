import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

export const XIcon = () => {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 20 20" fill="none">
      <Circle cx="10" cy="10" r="10" fill="#171717" />
      <Path
        d="M14.0258 4H16.1726L11.4825 9.08308L17 16H12.6799L9.2962 11.8049L5.42451 16H3.27646L8.29291 10.5631L3 4H7.4298L10.4883 7.83446L14.0258 4ZM13.2724 14.7815H14.4619L6.78343 5.15446H5.50693L13.2724 14.7815Z"
        fill="white"
      />
    </Svg>
  );
};
