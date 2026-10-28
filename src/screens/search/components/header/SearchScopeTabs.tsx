import React, { useEffect, useRef } from 'react';
import { Pressable, ScrollView, Text } from 'react-native';

import type { TabItem } from '@/components-next/common/tabs';
import { tailwind } from '@/theme';

type SearchScopeTabsProps = {
  items: TabItem[];
  activeTabId: string;
  onTabPress: (tabId: string) => void;
};

// iOS search scopes: a scrolling row of capsules, the selected one filled dark (like the
// filter capsules in Photos and Music), with the result count after the label.
export const SearchScopeTabs = ({ items, activeTabId, onTabPress }: SearchScopeTabsProps) => {
  const scrollRef = useRef<ScrollView>(null);
  const offsets = useRef<Record<string, number>>({});

  // Keep the selected scope in view when it changes from outside (e.g. "View more").
  useEffect(() => {
    const x = offsets.current[activeTabId];
    if (x !== undefined) scrollRef.current?.scrollTo({ x: Math.max(0, x - 16), animated: true });
  }, [activeTabId]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      style={tailwind.style('grow-0')}
      contentContainerStyle={tailwind.style('px-4 pt-1 pb-3 gap-2')}>
      {items.map(item => {
        const isActive = item.id === activeTabId;
        return (
          <Pressable
            key={item.id}
            onLayout={e => (offsets.current[item.id] = e.nativeEvent.layout.x)}
            onPress={() => onTabPress(item.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            style={({ pressed }) =>
              tailwind.style(
                'h-8 px-3.5 rounded-full flex-row items-center justify-center',
                isActive ? 'bg-gray-950' : 'bg-gray-100',
                pressed && 'opacity-70',
              )
            }>
            <Text
              style={tailwind.style(
                'text-[15px] leading-[20px] font-inter-medium-24',
                isActive ? 'text-white' : 'text-gray-950',
              )}>
              {item.label}
              {item.count ? (
                <Text
                  style={tailwind.style(
                    'font-inter-normal-20',
                    isActive ? 'text-gray-500' : 'text-gray-700',
                  )}>
                  {` ${item.count}`}
                </Text>
              ) : null}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};
