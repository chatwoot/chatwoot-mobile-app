import React from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { avatarTheme, tailwind } from '@/theme';
import { cx } from '@/utils';

import { AvatarProps, AvatarSizes } from './Avatar';

interface TypingStatusProps {
  size: Partial<AvatarSizes>;
  parentsBackground: string;
}

interface AnimatedDotProps {
  size: AvatarSizes;
  delay: number;
}

const AnimatedDot: React.FC<AnimatedDotProps> = ({ size, delay }) => {
  const dotAnimation = useSharedValue(0);
  React.useEffect(() => {
    dotAnimation.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, {
          duration: 1000,
          easing: Easing.bezier(0.4, 0, 0.6, 1),
        }),
        -1,
        true,
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dotAnimation]);
  const dotAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(dotAnimation.value, [0, 0.5, 1], [1, 0.5, 1]),
    };
  });
  return (
    <Animated.View
      style={[
        tailwind.style(
          cx(
            avatarTheme.status.typing.innerDots.base,
            avatarTheme.status.typing.innerDots.size[size],
          ),
        ),
        dotAnimatedStyle,
      ]}
    />
  );
};

const TypingComponent: React.FC<TypingStatusProps> = ({ size, parentsBackground }) => {
  const delays = ['xl', '2xl', '3xl'].includes(size) ? [0, 333, 667] : [0, 500];

  return (
    <View
      style={[
        tailwind.style(cx(avatarTheme.status.typing.container)),
        avatarTheme.status.position,
        {
          borderColor: tailwind.color(parentsBackground),
          backgroundColor: tailwind.color(parentsBackground),
        },
      ]}>
      <View
        style={tailwind.style(
          cx(avatarTheme.status.typing.base, avatarTheme.status.typing.size[size]),
        )}>
        {delays.map(value => (
          <AnimatedDot key={value} size={size} delay={value} />
        ))}
      </View>
    </View>
  );
};

export const AvatarStatus: React.FC<Pick<AvatarProps, 'status' | 'size' | 'parentsBackground'>> = ({
  status,
  size,
  parentsBackground,
}) => {
  switch (status) {
    case 'active': {
      return (
        <View
          style={[
            tailwind.style(cx(avatarTheme.status.active.container)),
            avatarTheme.status.position,
            { borderColor: tailwind.color(parentsBackground) },
          ]}>
          <View
            style={tailwind.style(
              cx(avatarTheme.status.active.base, avatarTheme.status.active.size[size]),
            )}
          />
        </View>
      );
    }
    case 'away': {
      return (
        <View
          style={[
            tailwind.style(cx(avatarTheme.status.away.container)),
            avatarTheme.status.position,
            {
              borderColor: tailwind.color(parentsBackground),
              backgroundColor: tailwind.color(parentsBackground),
            },
          ]}>
          <View style={tailwind.style(cx(avatarTheme.status.away.size[size]))}>
            <Svg width="100%" height="100%" viewBox="0 0 4 4" fill="none">
              <Path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M2 4C3.10457 4 4 3.10457 4 2C4 0.895431 3.10457 0 2 0C0.895431 0 0 0.895431 0 2C0 3.10457 0.895431 4 2 4ZM2 3.25C2.69036 3.25 3.25 2.69036 3.25 2C3.25 1.30964 2.69036 0.75 2 0.75C1.30964 0.75 0.75 1.30964 0.75 2C0.75 2.69036 1.30964 3.25 2 3.25Z"
                fill={tailwind.color('text-gray-800')}
              />
            </Svg>
          </View>
        </View>
      );
    }
    case 'sleep': {
      return (
        <View
          style={[
            tailwind.style(cx(avatarTheme.status.sleep.container)),
            avatarTheme.status.position,
            {
              borderColor: tailwind.color(parentsBackground),
              backgroundColor: tailwind.color(parentsBackground),
            },
          ]}>
          <View style={tailwind.style(cx(avatarTheme.status.sleep.size[size]))}>
            <Svg width="100%" height="100%" viewBox="0 0 4 4" fill="none">
              <Path
                d="M3.97107 2.35964C3.98707 2.27194 3.88243 2.2173 3.8072 2.26514C3.57467 2.413 3.29869 2.49864 3.00271 2.49864C2.17354 2.49864 1.50136 1.82646 1.50136 0.997285C1.50136 0.701308 1.587 0.425334 1.73486 0.192796C1.7827 0.117568 1.72806 0.0129337 1.64036 0.0289269C0.707321 0.199076 0 1.01603 0 1.99819C0 3.10376 0.896241 4 2.00181 4C2.98397 4 3.80092 3.29268 3.97107 2.35964Z"
                fill={tailwind.color('text-gray-800')}
              />
            </Svg>
          </View>
        </View>
      );
    }
    case 'typing': {
      return <TypingComponent size={size} parentsBackground={parentsBackground} />;
    }
  }
};
