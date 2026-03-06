import React, { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Tabs, type TabItem } from '@/components-next/common/tabs';

import { tailwind } from '@/theme';
import { useSearchScreen } from './hooks/useSearchScreen';
import { SearchHeader } from './components/header/SearchHeader';
import { SearchContent } from './components/views/SearchContent';
import type { SearchSectionType } from '@/store/search/searchTypes';
import { SEARCH_SECTIONS } from '@/screens/search/config';
import { createRenderItem } from './utils/renderItem';

const SearchScreen = () => {
  const {
    searchText,
    recentSearches,
    showRecentSearches,
    activeTab,
    expandedSections,
    sectionData,
    isLoading,
    isSearchCompleted,
    tabData,
    searchQuery,
    allSectionsData,
    listRefs,
    handleSearchChange,
    handleRecentSearchSelect,
    handleClearRecentSearches,
    handleBackPress,
    handleLoadMore,
    handleViewMore,
    handleTabChange,
    getItemsToShow,
    createEndReachedHandler,
    navigation,
    dispatch,
  } = useSearchScreen();

  const renderItem = useMemo(
    () => createRenderItem(searchQuery, allSectionsData, navigation, dispatch),
    [searchQuery, allSectionsData, navigation, dispatch],
  );

  const handleSectionTabChange = useCallback(
    (sectionId: SearchSectionType) => {
      handleTabChange(sectionId);
    },
    [handleTabChange],
  );

  const tabItems: TabItem[] = useMemo(
    () => [
      {
        id: 'all',
        label: 'All Results',
      },
      ...SEARCH_SECTIONS.map(section => ({
        id: section.id,
        label: section.label,
        count: sectionData[section.id]?.items?.length || 0,
      })),
    ],
    [sectionData],
  );

  return (
    <SafeAreaView edges={['top']} style={tailwind.style('flex-1 bg-white')}>
      <SearchHeader
        searchText={searchText}
        isLoading={isLoading}
        onSearchChange={handleSearchChange}
        onClear={() => handleSearchChange('')}
        onBackPress={handleBackPress}
      />
      {searchText.length >= 2 && (
        <View style={tailwind.style('pl-4 py-6')}>
          <Tabs items={tabItems} activeTabId={activeTab} onTabPress={handleTabChange} />
        </View>
      )}
      <Animated.View
        key={activeTab}
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(150)}
        style={tailwind.style('flex-1')}>
        <SearchContent
          showRecentSearches={showRecentSearches}
          recentSearches={recentSearches}
          searchText={searchText}
          activeTab={activeTab}
          isSearchCompleted={isSearchCompleted}
          sectionData={sectionData}
          tabData={tabData}
          expandedSections={expandedSections}
          searchQuery={searchQuery}
          allSectionsData={allSectionsData}
          listRefs={listRefs}
          getItemsToShow={getItemsToShow}
          onRecentSearchSelect={handleRecentSearchSelect}
          onClearRecentSearches={handleClearRecentSearches}
          onViewMore={handleViewMore}
          onLoadMore={handleLoadMore}
          onTabChange={handleSectionTabChange}
          onEndReached={createEndReachedHandler}
          renderItem={renderItem}
        />
      </Animated.View>
    </SafeAreaView>
  );
};

export default SearchScreen;
