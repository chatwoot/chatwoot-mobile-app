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

export const LinkedinIcon = () => {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 14 14" fill="none">
      <Path
        d="M11.9274 11.9303H9.85425V8.68175C9.85425 7.90708 9.8385 6.91017 8.77392 6.91017C7.693 6.91017 7.52792 7.75308 7.52792 8.62458V11.9303H5.45475V5.25H7.44625V6.16058H7.47308C7.75133 5.63558 8.428 5.08142 9.43892 5.08142C11.5395 5.08142 11.928 6.46392 11.928 8.2635L11.9274 11.9303ZM3.11325 4.33592C2.9551 4.33599 2.79848 4.30488 2.65236 4.24436C2.50625 4.18383 2.3735 4.09509 2.26172 3.9832C2.14994 3.87132 2.06133 3.73848 2.00095 3.59231C1.94056 3.44614 1.9096 3.28949 1.90983 3.13133C1.90995 2.8932 1.98067 2.66046 2.11307 2.46253C2.24546 2.26459 2.43357 2.11036 2.65362 2.01934C2.87367 1.92832 3.11576 1.9046 3.34929 1.95117C3.58282 1.99774 3.7973 2.11251 3.9656 2.28097C4.1339 2.44944 4.24847 2.66402 4.29481 2.8976C4.34116 3.13118 4.3172 3.37325 4.22596 3.59321C4.13473 3.81316 3.98032 4.00113 3.78225 4.13333C3.58419 4.26553 3.35138 4.33603 3.11325 4.33592ZM4.15275 11.9303H2.07375V5.25H4.15275V11.9303ZM12.9646 0H1.03308C0.462 0 0 0.4515 0 1.00858V12.9914C0 13.5491 0.462 14 1.03308 14H12.9628C13.5333 14 14 13.5491 14 12.9914V1.00858C14 0.4515 13.5333 0 12.9628 0H12.9646Z"
        fill="#838383"
      />
    </Svg>
  );
};

export const GithubIcon = () => {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 14 14" fill="none">
      <Path
        d="M7 0.172852C3.1325 0.172852 0 3.3071 0 7.17285C0 10.2663 2.0055 12.8895 4.78625 13.8141C5.13625 13.88 5.26458 13.6636 5.26458 13.4775C5.26458 13.3113 5.25875 12.8709 5.25583 12.2875C3.30867 12.7099 2.898 11.3484 2.898 11.3484C2.5795 10.5404 2.11925 10.3246 2.11925 10.3246C1.48517 9.8906 2.16825 9.89935 2.16825 9.89935C2.87117 9.94835 3.24042 10.6204 3.24042 10.6204C3.86458 11.6908 4.879 11.3816 5.27917 11.2025C5.34217 10.7499 5.52242 10.4413 5.7225 10.2663C4.16792 10.0913 2.534 9.48927 2.534 6.8071C2.534 6.04293 2.80525 5.41877 3.25442 4.92877C3.17567 4.75202 2.93942 4.04035 3.31567 3.0761C3.31567 3.0761 3.90192 2.88827 5.24067 3.7936C5.80067 3.63785 6.39567 3.56085 6.99067 3.55735C7.58567 3.56085 8.18067 3.63785 8.74067 3.7936C10.0707 2.88827 10.6569 3.0761 10.6569 3.0761C11.0332 4.04035 10.7969 4.75202 10.7269 4.92877C11.1732 5.41877 11.4444 6.04293 11.4444 6.8071C11.4444 9.49627 9.80817 10.0884 8.25067 10.2604C8.49567 10.4704 8.72317 10.8998 8.72317 11.5554C8.72317 12.4923 8.71442 13.2448 8.71442 13.4723C8.71442 13.656 8.83692 13.8748 9.19567 13.8048C11.9962 12.8866 14 10.2616 14 7.17285C14 3.3071 10.8657 0.172852 7 0.172852Z"
        fill="#838383"
      />
    </Svg>
  );
};
