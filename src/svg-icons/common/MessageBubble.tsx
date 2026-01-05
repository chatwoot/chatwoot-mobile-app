import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface MessageBubbleProps {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  fill = '#FFFFFF',
  stroke = '#000000',
  strokeWidth = 2,
}) => {
  return (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      {/* Round speech bubble with tail, same shape as ConversationIcon - adapted path */}
      <Path
        d="M17.5 15.5H11.9991C8.58 15.5 6 12.92 6 9.5C6 6.08 8.58 3.5 11.9992 3.5C15.42 3.5 18 6.08 18 9.5V15.5Z"
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
