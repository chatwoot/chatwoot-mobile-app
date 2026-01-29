import React from 'react';
import { ScrollView } from 'react-native';

import { tailwind } from '@/theme';
import { TAB_BAR_HEIGHT } from '@/constants';
import { SEARCH_SECTIONS, type SearchSectionType } from '@/screens/search/config';
import type { TabType } from '../hooks/useSearchScreen';
import { SearchSection } from '../shared/SearchSection';

interface AllResultsViewProps {
  sectionData: Record<SearchSectionType, {
    items: any[];
    isLoading: boolean;
    currentPage: number;
    hasMore: boolean;
  }>;
  tabData: Record<SearchSectionType, any[]>;
  expandedSections: Record<SearchSectionType, boolean>;
  activeTab: TabType;
  searchQuery: string;
  getItemsToShow: (items: any[], sectionId: SearchSectionType) => any[];
  onViewMore: (sectionId: SearchSectionType) => void;
  onLoadMore: (sectionId: SearchSectionType) => void;
  onTabChange: (sectionId: SearchSectionType) => void;
  renderItem: (item: any, sectionId: SearchSectionType, isLast?: boolean) => React.ReactNode;
}

export function AllResultsView({
  sectionData,
  tabData,
  expandedSections,
  activeTab,
  searchQuery,
  getItemsToShow,
  onViewMore,
  onLoadMore,
  onTabChange,
  renderItem,
}: AllResultsViewProps) {
  return (
    <ScrollView
      style={tailwind.style('flex-1')}
      contentContainerStyle={tailwind.style(`pb-[${TAB_BAR_HEIGHT - 1}px]`)}>
      {SEARCH_SECTIONS.map(section => {
        const sectionState = sectionData[section.id];
        const items = tabData[section.id] || [];
        const itemsToShow = getItemsToShow(items, section.id);
        
        return (
          <SearchSection
            key={section.id}
            sectionId={section.id}
            items={items}
            itemsToShow={itemsToShow}
            isLoadingMore={sectionState.isLoading && sectionState.currentPage > 1}
            hasMore={sectionState.hasMore}
            isInitialLoading={sectionState.isLoading && sectionState.currentPage === 1}
            isExpanded={expandedSections[section.id] ?? true}
            activeTab={activeTab}
            searchQuery={searchQuery}
            onViewMore={onViewMore}
            onLoadMore={onLoadMore}
            onTabChange={onTabChange}
            renderItem={renderItem}
          />
        );
      })}
    </ScrollView>
  );
}
