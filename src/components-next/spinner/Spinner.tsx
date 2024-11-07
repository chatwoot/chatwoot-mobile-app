import React from 'react';
import { ViewProps } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import tailwind from 'twrnc';

import { LoadingIcon } from '@/svg-icons';
import { withAnchorPoint } from '@/utils';
import { Icon } from '../common';

interface SpinnerProps extends Pick<ViewProps, 'style'> {
  size: number;
  stroke?: string;
}

export const Spinner = (props: SpinnerProps) => {
  const { size, style = {}, stroke } = props;
  const rotation = useSharedValue(0);
  React.useEffect(() => {
    rotation.value = withRepeat(
      withTiming(rotation.value + 1, {
        duration: 1350,
        easing: Easing.bezier(0, 0, 0.58, 1),
      }),
      -1,
      false,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const animatedStyle = useAnimatedStyle(() => {
    const transforms = withAnchorPoint(
      {
        transform: [{ rotate: `${rotation.value * 360}deg` }],
      },
      { x: 0.5, y: 0.5 },
      { width: size, height: size },
    );
    return { ...transforms };
  });

  return (
    <Animated.View
      entering={FadeIn}
      exiting={FadeOut}
      style={[tailwind.style('flex items-center justify-center'), animatedStyle, style]}>
      <Icon icon={<LoadingIcon stroke={stroke} />} size={size} />
    </Animated.View>
  );
};
