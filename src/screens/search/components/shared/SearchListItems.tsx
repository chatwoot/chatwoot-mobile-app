import React from 'react';
import { ActivityIndicator } from 'react-native';
import Animated, { FadeIn, Layout, LinearTransition } from 'react-native-reanimated';
import { FlashList } from '@shopify/flash-list';

import { tailwind } from '@/theme';
import { TAB_BAR_HEIGHT } from '@/constants';
import type { SearchSectionType } from '@/screens/search/config';

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList<any>) as typeof FlashList<any>;

interface SearchListItemsProps {
  sectionId: SearchSectionType;
  items: any[];
  renderItem: (item: any, sectionId: SearchSectionType, isLast?: boolean) => React.ReactNode;
  getItemId: (item: any) => string | number;
  useFlashList?: boolean;
  listRef?: React.RefObject<FlashList<any>>;
  onEndReached?: () => void;
  isLoadingMore?: boolean;
  estimatedItemSize?: number;
}

export function SearchListItems({
  sectionId,
  items,
  renderItem,
  getItemId,
  useFlashList = true,
  listRef,
  onEndReached,
  isLoadingMore,
  estimatedItemSize = 80,
}: SearchListItemsProps) {
  if (useFlashList) {
    return (
      <Animated.View
        layout={LinearTransition.springify().damping(18).stiffness(120)}
        style={tailwind.style('flex-1')}>
        <AnimatedFlashList
          ref={listRef}
          data={items}
          estimatedItemSize={estimatedItemSize}
          keyExtractor={(item) => `${sectionId}-${getItemId(item)}`}
          renderItem={({ item, index }) => {
            const isLast = index === items.length - 1;
            return renderItem(item, sectionId, isLast) as React.ReactElement | null;
          }}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={tailwind.style(`pb-[${TAB_BAR_HEIGHT - 1}px]`)}
          ListFooterComponent={
            isLoadingMore ? (
              <Animated.View
                entering={FadeIn.duration(200)}
                style={tailwind.style('py-4 items-center')}>
                <ActivityIndicator size="small" />
              </Animated.View>
            ) : null
          }
        />
      </Animated.View>
    );
  }

  return (
    <>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <Animated.View
            key={`${sectionId}-${getItemId(item)}-${index}`}
            entering={FadeIn.duration(200).delay(index * 30)}
            layout={Layout.springify().damping(20).stiffness(180)}>
            {renderItem(item, sectionId, isLast)}
          </Animated.View>
        );
      })}
    </>
  );
}
