import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

type CollapsibleProps = {
  expanded: boolean;
  duration?: number;
  children: React.ReactNode;
};

// Animates its content height between 0 (collapsed) and the measured content
// height (expanded).
export const Collapsible = ({ expanded, duration = 250, children }: CollapsibleProps) => {
  const contentHeight = useSharedValue(0);
  const measured = useSharedValue(false);
  const progress = useSharedValue(expanded ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(expanded ? 1 : 0, { duration });
  }, [expanded, duration, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    if (!measured.value) {
      return { opacity: expanded ? 1 : 0 };
    }
    return {
      height: progress.value * contentHeight.value,
      opacity: progress.value,
    };
  });

  return (
    <Animated.View style={[animatedStyle, { overflow: 'hidden' }]}>
      <View
        onLayout={e => {
          const h = e.nativeEvent.layout.height;
          if (h > 0) {
            contentHeight.value = h;
            measured.value = true;
          }
        }}>
        {children}
      </View>
    </Animated.View>
  );
};
