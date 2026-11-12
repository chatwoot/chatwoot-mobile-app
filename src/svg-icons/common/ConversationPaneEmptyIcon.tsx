import Svg, { Circle, Path } from 'react-native-svg';

export const ConversationPaneEmptyIcon = ({
  backgroundColor = '#F9F9F9',
}: {
  // Must match the background colour.
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
