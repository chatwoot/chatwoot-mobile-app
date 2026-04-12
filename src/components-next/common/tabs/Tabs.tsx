import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { tailwind, useThemedStyles } from '@/theme';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

export interface TabsProps {
  items: TabItem[];
  activeTabId: string;
  onTabPress: (tabId: string) => void;
}

const ANIM_CONFIG = { duration: 250, easing: Easing.bezier(0.25, 0.1, 0.25, 1) };

type TabMeasurement = { x: number; width: number };

/**
 * A horizontal tab component with animated sliding indicator.
 * Features automatic scrolling to center the active tab and smooth transitions.
 */
export const Tabs = ({ items, activeTabId, onTabPress }: TabsProps) => {
  const styles = useThemedStyles();
  const scrollViewRef = useRef<ScrollView>(null);
  const containerWidthRef = useRef<number>(0);
  const measuresRef = useRef<Record<string, TabMeasurement>>({});
  const [isMeasured, setIsMeasured] = useState(false);
  const indicatorX = useSharedValue(0);
  const indicatorW = useSharedValue(0);

  useEffect(() => {
    const measure = measuresRef.current[activeTabId];
    if (!measure) return;

    if (indicatorW.value === 0) {
      indicatorX.value = measure.x;
      indicatorW.value = measure.width;
    } else {
      indicatorX.value = withTiming(measure.x, ANIM_CONFIG);
      indicatorW.value = withTiming(measure.width, ANIM_CONFIG);
    }

    const containerW = containerWidthRef.current;
    if (scrollViewRef.current && containerW > 0) {
      const tabCenter = measure.x + measure.width / 2;
      const scrollX = tabCenter - containerW / 2;

      scrollViewRef.current.scrollTo({
        x: Math.max(0, scrollX),
        animated: true,
      });
    }
  }, [activeTabId, items, isMeasured, indicatorW, indicatorX]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: indicatorW.value,
    opacity: indicatorW.value > 0 ? 1 : 0,
  }));

  return (
    <View style={tailwind.style('w-full')}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[tailwind.style('rounded-lg grow-0 overflow-hidden'), styles.bgSecondary]}
        contentContainerStyle={tailwind.style('items-center')}
        onLayout={e => (containerWidthRef.current = e.nativeEvent.layout.width)}
      >
        <Animated.View
          style={[
            tailwind.style('absolute top-0 bottom-0 rounded-lg shadow-sm z-0'),
            styles.bgPrimary,
            { borderWidth: 1, borderColor: styles.colors.border },
            indicatorStyle,
          ]}
        />

        {items.map((item, index) => {
          const isActive = activeTabId === item.id;
          const showDivider =
            !isActive && index !== items.length - 1 && items[index + 1]?.id !== activeTabId;

          return (
            <View
              key={item.id}
              style={tailwind.style('flex-row items-center z-10')}
              onLayout={e => {
                const { x, width } = e.nativeEvent.layout;
                measuresRef.current[item.id] = { x, width };

                if (isActive && !isMeasured) {
                  setIsMeasured(true);
                }
              }}
            >
              <Pressable
                onPress={() => onTabPress(item.id)}
                hitSlop={8}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                style={({ pressed }) =>
                  tailwind.style('px-4 py-1.5 justify-center items-center', pressed && 'opacity-70')
                }
              >
                <Text
                  style={[
                    tailwind.style('text-sm font-medium', isActive ? 'text-blue-800' : ''),
                    !isActive && styles.textSecondary,
                  ]}
                >
                  {item.label}
                  {!!item.count && ` (${item.count})`}
                </Text>
              </Pressable>

              <View
                style={[
                  tailwind.style('w-px h-4', !showDivider && 'opacity-0'),
                  { backgroundColor: styles.colors.border },
                ]}
              />
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};
