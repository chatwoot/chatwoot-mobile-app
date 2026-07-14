import React from 'react';
import { TextInput } from 'react-native';
import Animated, { SharedValue, useAnimatedProps, useDerivedValue } from 'react-native-reanimated';

import { tailwind } from '@/theme';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const formatTime = (milliseconds: number) => {
  'worklet';
  if (!milliseconds || isNaN(milliseconds) || milliseconds < 0) {
    return '00:00';
  }
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const pad = (value: number) => (value < 10 ? `0${value}` : `${value}`);
  return `${pad(minutes)}:${pad(seconds)}`;
};

type AudioTimerProps = {
  currentPosition: SharedValue<number>;
  totalDuration: SharedValue<number>;
  textColor: string;
};

export const AudioTimer = ({ currentPosition, totalDuration, textColor }: AudioTimerProps) => {
  const text = useDerivedValue(
    () => `${formatTime(currentPosition.value)} / ${formatTime(totalDuration.value)}`,
  );

  const animatedProps = useAnimatedProps(() => ({ text: text.value }) as object);

  return (
    <AnimatedTextInput
      editable={false}
      underlineColorAndroid="transparent"
      value={text.value}
      animatedProps={animatedProps}
      style={tailwind.style(
        'p-0 text-xs font-inter-420-20 tracking-[0.32px] leading-[14px]',
        textColor,
      )}
    />
  );
};
