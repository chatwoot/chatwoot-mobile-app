import React from 'react';
import Svg, { Circle, ClipPath, Defs, G, Rect, Path } from 'react-native-svg';

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

export const XFilledIcon = () => {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 20 20" fill="none">
      <G clipPath="url(#clip0_2219_26963)">
        <Circle cx="10" cy="10" r="10" fill="#BBBBBB" />
        <Path
          d="M13.3542 5H15.1432L11.2348 9.2359L15.8327 15H12.2326L9.41285 11.5041L6.18644 15H4.3964L8.57678 10.4692L4.16602 5H7.85751L10.4063 8.19538L13.3542 5ZM12.7263 13.9846H13.7176L7.31888 5.96205H6.25512L12.7263 13.9846Z"
          fill="white"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_2219_26963">
          <Rect width="20" height="20" rx="5" fill="white" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};
