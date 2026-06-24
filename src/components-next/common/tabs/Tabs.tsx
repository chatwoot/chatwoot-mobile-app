import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { tailwind } from '@/theme';

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

export const Tabs = ({ items, activeTabId, onTabPress }: TabsProps) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const indicatorX = useSharedValue(0);
  const indicatorW = useSharedValue(0);
  const activeIndex = Math.max(
    0,
    items.findIndex(item => item.id === activeTabId),
  );

  useEffect(() => {
    const segmentWidth = items.length > 0 ? containerWidth / items.length : 0;
    if (!segmentWidth) return;

    if (indicatorW.value === 0) {
      indicatorX.value = segmentWidth * activeIndex;
      indicatorW.value = segmentWidth;
    } else {
      indicatorX.value = withTiming(segmentWidth * activeIndex, ANIM_CONFIG);
      indicatorW.value = withTiming(segmentWidth, ANIM_CONFIG);
    }
  }, [activeIndex, containerWidth, indicatorW, indicatorX, items.length]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: indicatorW.value,
    opacity: indicatorW.value > 0 ? 1 : 0,
  }));

  return (
    <View style={tailwind.style('w-full')}>
      <View
        style={tailwind.style('bg-gray-50 rounded-lg overflow-hidden flex-row')}
        onLayout={e => setContainerWidth(e.nativeEvent.layout.width)}>
        <Animated.View
          style={[
            tailwind.style(
              'absolute left-0 top-0 bottom-0 bg-white rounded-lg shadow-sm border border-gray-200 z-0',
            ),
            indicatorStyle,
          ]}
        />

        {items.map((item, index) => {
          const isActive = activeTabId === item.id;
          const showDivider =
            !isActive && index !== items.length - 1 && items[index + 1]?.id !== activeTabId;

          return (
            <View key={item.id} style={tailwind.style('flex-1 flex-row items-center z-10')}>
              <Pressable
                onPress={() => onTabPress(item.id)}
                hitSlop={8}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                style={({ pressed }) =>
                  tailwind.style(
                    'flex-1 px-1 py-1.5 justify-center items-center',
                    pressed && 'opacity-70',
                  )
                }>
                <Text
                  numberOfLines={1}
                  style={tailwind.style(
                    'text-sm font-medium',
                    isActive ? 'text-blue-800' : 'text-gray-800',
                  )}>
                  {item.label}
                  {!!item.count && ` (${item.count})`}
                </Text>
              </Pressable>

              <View style={tailwind.style('w-px h-4 bg-gray-300', !showDivider && 'opacity-0')} />
            </View>
          );
        })}
      </View>
    </View>
  );
};
