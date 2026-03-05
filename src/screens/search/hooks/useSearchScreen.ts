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
import { clearSearchResults, setQuery } from '@/store/search/searchSlice';
import { RecentSearches } from '../utils/recentSearches';
import type { SearchItem, SearchSectionType } from '@/store/search/searchTypes';
import { SEARCH_SECTIONS } from '@/screens/search/config';

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

  const listRefs = useRef<Record<SearchSectionType, React.RefObject<FlashList<SearchItem>>>>(
    {} as Record<SearchSectionType, React.RefObject<FlashList<SearchItem>>>,
  );
  SEARCH_SECTIONS.forEach(section => {
    if (!listRefs.current[section.id]) {
      listRefs.current[section.id] = React.createRef<FlashList<SearchItem>>();
    }
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
    debouncedSearchRef.current = debounce((searchQuery: string) => {
      const trimmedQuery = searchQuery.trim();
      if (trimmedQuery.length >= 2) {
        dispatch(setQuery(trimmedQuery));
        dispatch(clearSearchResults());
        SEARCH_SECTIONS.forEach(section => {
          dispatch(searchSection({ sectionId: section.id, q: trimmedQuery, page: 1 }));
        });
        RecentSearches.add(trimmedQuery).then(() => {
          RecentSearches.get().then(setRecentSearches);
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
      } else {
        dispatch(clearSearchResults());
        RecentSearches.get().then(setRecentSearches);
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
      if (!text || text.trim().length === 0) {
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
      dispatch(clearSearchResults());
      SEARCH_SECTIONS.forEach(section => {
        dispatch(searchSection({ sectionId: section.id, q: recentQuery, page: 1 }));
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
      dispatch(searchSection({ sectionId, q: searchQuery, page: nextPage }));
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
    setActiveTab(tabId as TabType);
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

  const loadingMoreRef = useRef<Record<SearchSectionType, boolean>>(
    {} as Record<SearchSectionType, boolean>,
  );
  SEARCH_SECTIONS.forEach(section => {
    if (loadingMoreRef.current[section.id] === undefined) {
      loadingMoreRef.current[section.id] = false;
    }
  });

  const createEndReachedHandler = useCallback(
    (sectionId: SearchSectionType) => {
      return () => {
        const section = sectionData[sectionId];
        if (!section) {
          return;
        }

        const currentSearchQuery = searchText.trim() || query.trim();

        if (section.isLoading) {
          return;
        }

        if (!section.hasMore) {
          return;
        }

        if (!currentSearchQuery) {
          return;
        }

        if (loadingMoreRef.current[sectionId]) {
          return;
        }

        loadingMoreRef.current[sectionId] = true;
        handleLoadMore(sectionId);
        setTimeout(() => {
          loadingMoreRef.current[sectionId] = false;
        }, 1000);
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
      if (section && listRefs.current[section.id]?.current) {
        setTimeout(() => {
          listRefs.current[section.id]?.current?.scrollToOffset({ offset: 0, animated: true });
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
    listRefs: listRefs.current,
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
