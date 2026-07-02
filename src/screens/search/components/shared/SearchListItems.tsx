import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { FlashList, FlashListRef } from '@shopify/flash-list';

import { tailwind } from '@/theme';
import { TAB_BAR_HEIGHT } from '@/constants';
import type { SearchItem, SearchSectionType } from '@/store/search/searchTypes';

const AnimatedFlashList = Animated.createAnimatedComponent(
  FlashList<SearchItem>,
) as typeof FlashList<SearchItem>;

interface SearchListItemsProps {
  sectionId: SearchSectionType;
  items: SearchItem[];
  renderItem: (item: SearchItem, sectionId: SearchSectionType, isLast?: boolean) => React.ReactNode;
  getItemId: (item: SearchItem) => string | number;
  useFlashList?: boolean;
  listRef?: React.RefObject<FlashListRef<SearchItem>>;
  onEndReached?: () => void;
  isLoadingMore?: boolean;
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
}: SearchListItemsProps) {
  if (useFlashList) {
    return (
      <View style={tailwind.style('flex-1')}>
        <AnimatedFlashList
          ref={listRef}
          data={items}
          keyExtractor={item => `${sectionId}-${getItemId(item)}`}
          renderItem={({ item, index }) => {
            const isLast = index === items.length - 1;
            return renderItem(item, sectionId, isLast) as React.ReactElement | null;
          }}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
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
      </View>
    );
  }

  return (
    <>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <Animated.View
            key={`${sectionId}-${getItemId(item)}-${index}`}
            entering={FadeIn.duration(200).delay(index * 30)}>
            {renderItem(item, sectionId, isLast)}
          </Animated.View>
        );
      })}
    </>
  );
}
