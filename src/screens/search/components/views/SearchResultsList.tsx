import React from 'react';
import { ActivityIndicator } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { FlashList } from '@shopify/flash-list';

import { tailwind } from '@/theme';
import { type SearchSectionType, SEARCH_SECTIONS, getSearchSectionById } from '@/screens/search/config';
import { SearchEmptyState } from '../shared/SearchEmptyState';
import { SearchListItems } from '../shared/SearchListItems';

interface SearchResultsListProps {
  sectionId: SearchSectionType;
  items: any[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  searchQuery: string;
  renderItem: (item: any, sectionId: SearchSectionType, isLast?: boolean) => React.ReactNode;
  listRef: React.RefObject<FlashList<any>>;
  onEndReached: () => void;
}

export function SearchResultsList({
  sectionId,
  items,
  isLoading,
  isLoadingMore,
  hasMore,
  searchQuery,
  renderItem,
  listRef,
  onEndReached,
}: SearchResultsListProps) {
  const section = SEARCH_SECTIONS.find(s => s.id === sectionId);
  
  if (!section || (isLoading && items.length === 0)) {
    return (
      <Animated.View
        entering={FadeIn.duration(200)}
        style={tailwind.style('flex-1 items-center justify-center')}>
        <ActivityIndicator />
      </Animated.View>
    );
  }

  if (items.length === 0 && !isLoading) {
    return <SearchEmptyState sectionLabel={section.label} searchQuery={searchQuery} />;
  }

  return (
    <SearchListItems
      sectionId={sectionId}
      items={items}
      renderItem={renderItem}
      getItemId={section.getItemId}
      useFlashList={true}
      listRef={listRef}
      onEndReached={onEndReached}
      isLoadingMore={isLoadingMore}
    />
  );
}
