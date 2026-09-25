import React from 'react';
import { View, useWindowDimensions } from 'react-native';

import { tailwind } from '@/theme';
import { Defs, Ellipse, RadialGradient, Stop, Svg } from 'react-native-svg';

import { CALL_TONES, type CallTone } from '../constants/callTheme';

// Two soft washes of the phase colour over the light ground: a large one behind the
// caller and a smaller one low on the right, under the controls
export const CallBackdrop = ({ tone }: { tone: CallTone }) => {
  const { width, height } = useWindowDimensions();
  const colour = CALL_TONES[tone].wash;
  return (
    <View style={tailwind.style('absolute inset-0 bg-[#F4F4F6]')}>
      <Svg width={width} height={height}>
        <Defs>
          <RadialGradient id="washTop" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={colour} stopOpacity={0.26} />
            <Stop offset="1" stopColor={colour} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="washLow" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={colour} stopOpacity={0.14} />
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
        <Ellipse
          cx={width * 0.8}
          cy={height * 0.9}
          rx={width * 0.5}
          ry={height * 0.3}
          fill="url(#washLow)"
        />
      </Svg>
    </View>
  );
};
