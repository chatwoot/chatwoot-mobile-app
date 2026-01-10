import React from 'react';
import Animated from 'react-native-reanimated';

import { tailwind } from '@/theme';
import { unixTimestampToReadableTime } from '@/utils/dateTimeUtils';
import { useTheme } from '@/context/ThemeContext';

type ActivityBubbleProps = {
  text?: string;
  timeStamp?: number;
};

export const ActivityBubble = (props: ActivityBubbleProps) => {
  try {
    const { text, timeStamp } = props || {};
    const { colors, isDark } = useTheme();
    
    if (!text) {
      return <Animated.View style={{ height: 0 }} />;
    }
    
    return (
      <Animated.View style={tailwind.style('flex flex-row flex-wrap justify-center py-1 px-10')}>
        <Animated.Text
          style={[
            tailwind.style(
              'text-cxs font-inter-420-20 tracking-[0.32px] leading-[18px] text-center',
            ),
            { color: isDark ? colors.textSecondary : tailwind.color('text-blackA-A11') },
          ]}>
          {text} {timeStamp ? unixTimestampToReadableTime(timeStamp) : ''}
        </Animated.Text>
      </Animated.View>
    );
  } catch (error) {
    console.error('[ActivityBubble] Render error:', error);
    return <Animated.View style={{ height: 0 }} />;
  }
};
