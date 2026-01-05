import React from 'react';
import Animated from 'react-native-reanimated';

import { tailwind } from '@/theme';
import { unixTimestampToReadableTime } from '@/utils/dateTimeUtils';

type ActivityBubbleProps = {
  text: string;
  timeStamp: number;
};

export const ActivityBubble = (props: ActivityBubbleProps) => {
  const { text, timeStamp } = props;
  return (
    <Animated.View style={tailwind.style('flex flex-row flex-wrap justify-center py-1 px-10')}>
      <Animated.Text
        style={tailwind.style(
          'text-cxs font-inter-420-20 tracking-[0.32px] leading-[18px] text-blackA-A11 text-center',
        )}
      >
        {text} {unixTimestampToReadableTime(timeStamp)}
      </Animated.Text>
    </Animated.View>
  );
};
