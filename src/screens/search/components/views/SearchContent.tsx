import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { FlashList } from '@shopify/flash-list';

import { tailwind } from '@/theme';
import type { SearchItem, SearchSectionType } from '@/store/search/searchTypes';
import { SEARCH_SECTIONS } from '@/screens/search/config';
import type { TabType } from '../../hooks/useSearchScreen';
import { RecentSearchesView } from './RecentSearchesView';
import { AllResultsView } from './AllResultsView';
import { SearchResultsList } from './SearchResultsList';
import { SearchEmptyState } from '../shared/SearchEmptyState';

interface SearchContentProps {
  showRecentSearches: boolean;
  recentSearches: string[];
  searchText: string;
  activeTab: TabType;
  isSearchCompleted: boolean;
  sectionData: Record<
    SearchSectionType,
    {
      items: SearchItem[];
      isLoading: boolean;
      currentPage: number;
      hasMore: boolean;
      hasError: boolean;
    }
  >;
  tabData: Record<SearchSectionType, SearchItem[]>;
  expandedSections: Record<SearchSectionType, boolean>;
  searchQuery: string;
  allSectionsData: Record<SearchSectionType, SearchItem[]>;
  listRefs: Record<SearchSectionType, React.RefObject<FlashList<SearchItem>>>;
  getItemsToShow: (items: SearchItem[], sectionId: SearchSectionType) => SearchItem[];
  onRecentSearchSelect: (query: string) => void;
  onClearRecentSearches: () => void;
  onViewMore: (sectionId: SearchSectionType) => void;
  onLoadMore: (sectionId: SearchSectionType) => void;
  onTabChange: (sectionId: SearchSectionType) => void;
  onEndReached: (sectionId: SearchSectionType) => () => void;
  renderItem: (item: SearchItem, sectionId: SearchSectionType, isLast?: boolean) => React.ReactNode;
}

export function SearchContent({
  showRecentSearches,
  recentSearches,
  searchText,
  activeTab,
  isSearchCompleted,
  sectionData,
  tabData,
  expandedSections,
  searchQuery,
  allSectionsData,
  listRefs,
  getItemsToShow,
  onRecentSearchSelect,
  onClearRecentSearches,
  onViewMore,
  onLoadMore,
  onTabChange,
  onEndReached,
  renderItem,
}: SearchContentProps) {
  if (searchText.length < 2) {
    return (
      <View style={tailwind.style('flex-1')}>
        {showRecentSearches && (
          <RecentSearchesView
            recentSearches={recentSearches}
            onSearchSelect={onRecentSearchSelect}
            onClear={onClearRecentSearches}
          />
        )}
        <View style={tailwind.style('flex-1 items-center justify-center px-4')}>
          <Text
            style={tailwind.style(
              'text-base font-inter-420-20 leading-[22px] tracking-[0.16px] text-gray-700 text-center',
            )}>
            Search by conversation id, email, phone number, messages for better search results.
          </Text>
        </View>
      </View>
    );
  }

  const totalResults = SEARCH_SECTIONS.reduce(
    (sum, section) => sum + (allSectionsData[section.id]?.length ?? 0),
    0,
  );

  const allSearchesFailed = SEARCH_SECTIONS.every(
    section => sectionData[section.id]?.hasError,
  );
  const hasResults = totalResults > 0;

  if (isSearchCompleted && allSearchesFailed && searchText.length >= 2) {
    return (
      <SearchEmptyState
        sectionLabel="results"
        searchQuery={searchText}
        errorMessage="Something went wrong. Please try again."
      />
    );
  }

  if (isSearchCompleted && !hasResults && searchText.length >= 2) {
    const sectionLabel =
      activeTab === 'all'
        ? 'Results'
        : SEARCH_SECTIONS.find(s => s.id === activeTab)?.label || 'Results';
    return <SearchEmptyState sectionLabel={sectionLabel} searchQuery={searchText} />;
  }

  const activeSection = SEARCH_SECTIONS.find(s => activeTab === s.id);
  if (activeSection) {
    const section = sectionData[activeSection.id];
    if (!section) {
      return (
        <Animated.View
          entering={FadeIn.duration(200)}
          style={tailwind.style('flex-1 items-center justify-center')}>
          <ActivityIndicator />
        </Animated.View>
      );
    }

    const items = tabData[activeSection.id] || [];
    const isLoading = section.isLoading && section.currentPage === 1;
    const isLoadingMore = section.isLoading && section.currentPage > 1;
    const hasMore = section.hasMore;

    return (
      <SearchResultsList
        sectionId={activeSection.id}
        items={items}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        searchQuery={searchQuery}
        renderItem={renderItem}
        listRef={listRefs[activeSection.id]}
        onEndReached={onEndReached(activeSection.id)}
      />
    );
  }

  return (
    <AllResultsView
      sectionData={sectionData}
      tabData={tabData}
      expandedSections={expandedSections}
      activeTab={activeTab}
      searchQuery={searchQuery}
      getItemsToShow={getItemsToShow}
      onViewMore={onViewMore}
      onLoadMore={onLoadMore}
      onTabChange={onTabChange}
      renderItem={renderItem}
    />
  );
}
