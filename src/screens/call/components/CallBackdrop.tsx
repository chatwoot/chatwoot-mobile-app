import React from 'react';
import { View, useWindowDimensions } from 'react-native';

import { useTailwind } from '@/theme/useTailwind';
import { Defs, Ellipse, RadialGradient, Stop, Svg } from 'react-native-svg';

import { useCallTheme, type CallTone } from '../constants/callTheme';

export const CallBackdrop = ({ tone }: { tone: CallTone }) => {
  const tailwind = useTailwind();
  const { CALL_BACKDROP, CALL_TONES } = useCallTheme();
  const { width, height } = useWindowDimensions();
  const { wash: colour, washTop } = CALL_TONES[tone];
  return (
    <View style={[tailwind.style('absolute inset-0'), { backgroundColor: CALL_BACKDROP }]}>
      <Svg width={width} height={height}>
        <Defs>
          <RadialGradient id="washTop" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={colour} stopOpacity={washTop} />
            <Stop offset="1" stopColor={colour} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Ellipse
          cx={width * 0.5}
          cy={height * 0.34}
          rx={width * 0.6}
          ry={height * 0.42}
          fill="url(#washTop)"
        />
      </Svg>
    </View>
  );
};
