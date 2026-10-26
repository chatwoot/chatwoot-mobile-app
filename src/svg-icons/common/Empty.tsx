import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

export const EmptyStateIcon = () => {
  return (
    <Svg width="74" height="44" viewBox="0 0 74 44" fill="none">
      <Path
        d="M31 43H15.9988C7.72958 43 1 36.27 1 27.9987C1 19.7301 7.72958 13 15.9989 13C24.2704 13 31 19.7301 31 27.9987V43Z"
        stroke="#C7C7C7"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M50 43H30.9985C20.5241 43 12 34.4753 12 23.9983C12 13.5247 20.5241 5 30.9987 5C41.4759 5 50 13.5247 50 23.9983V43Z"
        stroke="#C7C7C7"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M31 43H52.0017C63.5786 43 73 33.5779 73 21.9981C73 10.4221 63.5786 1 52.0015 1C40.4214 1 31 10.4221 31 21.9981V43Z"
        stroke="#C7C7C7"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

// Empty state for the split view's conversation pane: two incoming bubbles with a reply
// tucked in front of them, showing a typing indicator. The reply is filled and outlined
// in the background color first, so the lines behind it stop short with a small gap
// instead of crossing. Same size and outline style as EmptyStateIcon.
export const ConversationPaneEmptyIcon = ({
  backgroundColor = '#F9F9F9',
}: {
  // Must match what the icon sits on (the pane's gray-50 by default).
  backgroundColor?: string;
}) => {
  return (
    <Svg width="74" height="44" viewBox="0 0 74 44" fill="none">
      <Path
        d="M1 20V10.5C1 5.26 5.26 1 10.5 1H29.5C34.74 1 39 5.26 39 10.5C39 15.74 34.74 20 29.5 20H1Z"
        stroke="#C7C7C7"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M1 43V33.5C1 28.26 5.26 24 10.5 24H29.5C34.74 24 39 28.26 39 33.5C39 38.74 34.74 43 29.5 43H1Z"
        stroke="#C7C7C7"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M73 31.5H34.5C29.26 31.5 25 27.24 25 22C25 16.76 29.26 12.5 34.5 12.5H63.5C68.74 12.5 73 16.76 73 22V31.5Z"
        fill={backgroundColor}
        stroke={backgroundColor}
        strokeWidth="5.5"
        strokeLinejoin="round"
      />
      <Path
        d="M73 31.5H34.5C29.26 31.5 25 27.24 25 22C25 16.76 29.26 12.5 34.5 12.5H63.5C68.74 12.5 73 16.76 73 22V31.5Z"
        stroke="#C7C7C7"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="45" cy="22" r="1.6" fill="#C7C7C7" />
      <Circle cx="51" cy="22" r="1.6" fill="#C7C7C7" />
      <Circle cx="57" cy="22" r="1.6" fill="#C7C7C7" />
    </Svg>
  );
};

// Empty state for the Inbox split view's conversation pane: an inbox tray with a message
// above it, drawn small inside the same 74×44 frame and outline style as EmptyStateIcon.
export const NotificationPaneEmptyIcon = () => {
  return (
    <Svg width="74" height="44" viewBox="0 0 74 44" fill="none">
      <Path
        d="M24 24H50L56 31V38C56 40.21 54.21 42 52 42H22C19.79 42 18 40.21 18 38V31L24 24Z"
        stroke="#C7C7C7"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18 31H26C27.5 31 28.5 35 37 35C45.5 35 46.5 31 48 31H56"
        stroke="#C7C7C7"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M28 17V11C28 7.69 30.69 5 34 5H40C43.31 5 46 7.69 46 11C46 14.31 43.31 17 40 17H28Z"
        stroke="#C7C7C7"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
