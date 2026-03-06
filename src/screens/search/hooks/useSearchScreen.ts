import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import { debounce } from 'lodash';

import { useAppDispatch, useAppSelector } from '@/hooks';
import { searchSection } from '@/store/search/searchActions';
import {
  selectAllSearchSections,
  selectSearchIsLoading,
  selectSearchIsCompleted,
  selectSearchQuery,
} from '@/store/search/searchSelectors';
import { clearSearchResults, prepareNewSearch, setQuery } from '@/store/search/searchSlice';
import { RecentSearches } from '../utils/recentSearches';
import { SEARCH_SECTION_IDS, type SearchItem, type SearchSectionType } from '@/store/search/searchTypes';
import { SEARCH_SECTIONS } from '@/screens/search/config';

const VALID_TAB_IDS = new Set<string>(['all', ...SEARCH_SECTION_IDS]);

export type TabType = 'all' | SearchSectionType;

const INITIAL_ITEMS_TO_SHOW = 5;

export function useSearchScreen() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const [searchText, setSearchText] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [expandedSections, setExpandedSections] = useState<Record<SearchSectionType, boolean>>(
    () => {
      const initial: Record<SearchSectionType, boolean> = {} as Record<SearchSectionType, boolean>;
      SEARCH_SECTIONS.forEach(section => {
        initial[section.id] = true;
      });
      return initial;
    },
  );

  const [listRefs] = useState(() => {
    const refs = {} as Record<SearchSectionType, React.RefObject<FlashList<SearchItem>>>;
    SEARCH_SECTIONS.forEach(section => {
      refs[section.id] = React.createRef<FlashList<SearchItem>>();
    });
    return refs;
  });

  const sectionData = useAppSelector(selectAllSearchSections);
  const isLoading = useAppSelector(selectSearchIsLoading);
  const isSearchCompleted = useAppSelector(selectSearchIsCompleted);
  const query = useAppSelector(selectSearchQuery);

  useEffect(() => {
    RecentSearches.get().then(setRecentSearches);
  }, []);

  const debouncedSearchRef = useRef<ReturnType<typeof debounce> | null>(null);

  useEffect(() => {
    // Debounce only the API calls — loaders are shown immediately in handleSearchChange
    debouncedSearchRef.current = debounce((searchQuery: string) => {
      const trimmedQuery = searchQuery.trim();
      if (trimmedQuery.length >= 2) {
        SEARCH_SECTIONS.forEach(section => {
          dispatch(
            searchSection({
              sectionId: section.id,
              apiEndpoint: section.apiEndpoint,
              transformResponse: section.transformResponse,
              q: trimmedQuery,
              page: 1,
            }),
          );
        });
        RecentSearches.add(trimmedQuery).then(() => {
          RecentSearches.get().then(setRecentSearches);
        });
      }
    }, 500);

    return () => {
      if (debouncedSearchRef.current) {
        debouncedSearchRef.current.cancel();
      }
    };
  }, [dispatch]);

  const handleSearchChange = useCallback(
    (text: string) => {
      setSearchText(text);
      const trimmed = text.trim();

      if (trimmed.length < 2) {
        if (debouncedSearchRef.current) {
          debouncedSearchRef.current.cancel();
        }
        dispatch(clearSearchResults());
        dispatch(setQuery(''));
        setActiveTab('all');
        const newExpanded: Record<SearchSectionType, boolean> = {} as Record<
          SearchSectionType,
          boolean
        >;
        SEARCH_SECTIONS.forEach(section => {
          newExpanded[section.id] = true;
        });
        setExpandedSections(newExpanded);
        RecentSearches.get().then(setRecentSearches);
      } else {
        // Immediately show loaders and update query — don't wait for debounce
        dispatch(setQuery(trimmed));
        dispatch(prepareNewSearch());
        setActiveTab('all');
        const newExpanded: Record<SearchSectionType, boolean> = {} as Record<
          SearchSectionType,
          boolean
        >;
        SEARCH_SECTIONS.forEach(section => {
          newExpanded[section.id] = true;
        });
        setExpandedSections(newExpanded);
        // Debounce the actual API calls
        if (debouncedSearchRef.current) {
          debouncedSearchRef.current(text);
        }
      }
    },
    [dispatch],
  );

  const handleRecentSearchSelect = useCallback(
    (recentQuery: string) => {
      setSearchText(recentQuery);
      dispatch(setQuery(recentQuery));
      dispatch(prepareNewSearch());
      SEARCH_SECTIONS.forEach(section => {
        dispatch(
          searchSection({
            sectionId: section.id,
            apiEndpoint: section.apiEndpoint,
            transformResponse: section.transformResponse,
            q: recentQuery,
            page: 1,
          }),
        );
      });
      setActiveTab('all');
      const newExpanded: Record<SearchSectionType, boolean> = {} as Record<
        SearchSectionType,
        boolean
      >;
      SEARCH_SECTIONS.forEach(section => {
        newExpanded[section.id] = true;
      });
      setExpandedSections(newExpanded);
    },
    [dispatch],
  );

  const handleClearRecentSearches = useCallback(async () => {
    await RecentSearches.clear();
    setRecentSearches([]);
  }, []);

  const handleBackPress = useCallback(() => {
    dispatch(clearSearchResults());
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [dispatch, navigation]);

  const searchQuery = searchText.trim() || query.trim();

  const handleLoadMore = useCallback(
    (sectionId: SearchSectionType) => {
      if (!searchQuery) {
        return;
      }

      const section = sectionData[sectionId];
      if (!section) {
        return;
      }

      if (section.isLoading) {
        return;
      }

      if (!section.hasMore) {
        return;
      }

      const nextPage = section.currentPage;
      const sectionConfig = SEARCH_SECTIONS.find(s => s.id === sectionId);
      if (!sectionConfig) {
        return;
      }
      dispatch(
        searchSection({
          sectionId,
          apiEndpoint: sectionConfig.apiEndpoint,
          transformResponse: sectionConfig.transformResponse,
          q: searchQuery,
          page: nextPage,
        }),
      );
    },
    [searchQuery, sectionData, dispatch],
  );

  const handleViewMore = useCallback((sectionId: SearchSectionType) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  }, []);

  const handleTabChange = useCallback((tabId: string) => {
    if (VALID_TAB_IDS.has(tabId)) {
      setActiveTab(tabId as TabType);
    }
  }, []);

  const tabData = useMemo(() => {
    const results: Record<SearchSectionType, SearchItem[]> = {} as Record<
      SearchSectionType,
      SearchItem[]
    >;
    SEARCH_SECTIONS.forEach(section => {
      const sectionState = sectionData[section.id];
      if (!sectionState) {
        results[section.id] = [];
        return;
      }
      if (activeTab === 'all') {
        results[section.id] = sectionState.items || [];
      } else {
        results[section.id] = activeTab === section.id ? sectionState.items || [] : [];
      }
    });
    return results;
  }, [activeTab, sectionData]);

  const allSectionsData = useMemo(() => {
    const data: Record<SearchSectionType, SearchItem[]> = {} as Record<
      SearchSectionType,
      SearchItem[]
    >;
    SEARCH_SECTIONS.forEach(section => {
      data[section.id] = sectionData[section.id]?.items || [];
    });
    return data;
  }, [sectionData]);


  const createEndReachedHandler = useCallback(
    (sectionId: SearchSectionType) => {
      return () => {
        const section = sectionData[sectionId];
        if (!section) {
          return;
        }

        const currentSearchQuery = searchText.trim() || query.trim();

        if (!section.hasMore || section.isLoading) {
          return;
        }

        if (!currentSearchQuery) {
          return;
        }

        handleLoadMore(sectionId);
      };
    },
    [handleLoadMore, sectionData, searchText, query],
  );

  const getItemsToShow = useCallback(
    (items: SearchItem[], sectionId: SearchSectionType) => {
      if (activeTab === 'all') {
        return expandedSections[sectionId] ? items.slice(0, INITIAL_ITEMS_TO_SHOW) : [];
      }
      return items;
    },
    [activeTab, expandedSections],
  );

  const showRecentSearches = useMemo(() => {
    return searchText.length < 2 && recentSearches.length > 0;
  }, [searchText.length, recentSearches.length]);

  useEffect(() => {
    if (activeTab !== 'all') {
      const section = SEARCH_SECTIONS.find(s => activeTab === s.id);
      if (section && listRefs[section.id]?.current) {
        setTimeout(() => {
          listRefs[section.id]?.current?.scrollToOffset({ offset: 0, animated: true });
        }, 100);
      }
    }
  }, [activeTab]);

  return {
    searchText,
    recentSearches,
    showRecentSearches,
    activeTab,
    expandedSections,
    sectionData,
    isLoading,
    isSearchCompleted,
    query,
    searchQuery,
    tabData,
    allSectionsData,
    listRefs,
    handleSearchChange,
    handleRecentSearchSelect,
    handleClearRecentSearches,
    handleBackPress,
    handleLoadMore,
    handleViewMore,
    handleTabChange,
    setActiveTab,
    getItemsToShow,
    createEndReachedHandler,
    navigation,
    dispatch,
  };
}
