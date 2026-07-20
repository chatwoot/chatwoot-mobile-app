import React from 'react';
import { ActivityIndicator } from 'react-native';
import { FlashListRef } from '@shopify/flash-list';

import { tailwind } from '@/theme';
import type { SearchItem, SearchSectionType } from '@/store/search/searchTypes';
import { SEARCH_SECTIONS } from '@/screens/search/config';
import { FadeInView } from '../shared/FadeInView';
import { SearchEmptyState } from '../shared/SearchEmptyState';
import { SearchListItems } from '../shared/SearchListItems';
import i18n from 'i18n';

interface SearchResultsListProps {
  sectionId: SearchSectionType;
  items: SearchItem[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  searchQuery: string;
  renderItem: (item: SearchItem, sectionId: SearchSectionType, isLast?: boolean) => React.ReactNode;
  listRef: React.RefObject<FlashListRef<SearchItem>>;
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
      <FadeInView style={tailwind.style('flex-1 items-center justify-center')}>
        <ActivityIndicator />
      </FadeInView>
    );
  }

  if (items.length === 0 && !isLoading) {
    return <SearchEmptyState sectionLabel={i18n.t(section.labelKey)} searchQuery={searchQuery} />;
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
