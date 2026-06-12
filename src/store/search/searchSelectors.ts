import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/store';
import { type SearchItem, type SearchSectionType, SEARCH_SECTION_IDS } from './searchTypes';

export const selectSearchSection = (state: RootState, sectionId: SearchSectionType) =>
  state.search?.sections?.[sectionId];

export const selectSearchSectionItems = (state: RootState, sectionId: SearchSectionType) =>
  state.search?.sections?.[sectionId]?.items || [];

export const selectSearchSectionIsLoading = (state: RootState, sectionId: SearchSectionType) =>
  state.search?.sections?.[sectionId]?.isLoading || false;

export const selectSearchSectionCurrentPage = (state: RootState, sectionId: SearchSectionType) =>
  state.search?.sections?.[sectionId]?.currentPage || 1;

export const selectSearchSectionHasMore = (state: RootState, sectionId: SearchSectionType) =>
  state.search?.sections?.[sectionId]?.hasMore || false;

type SectionData = {
  items: SearchItem[];
  isLoading: boolean;
  currentPage: number;
  hasMore: boolean;
  hasError: boolean;
  isCancelled: boolean;
};

// Selector that returns all sections data at once
// createSelector automatically memoizes - only recomputes when state.search.sections changes
export const selectAllSearchSections = createSelector(
  [(state: RootState) => state.search?.sections],
  (sections): Record<SearchSectionType, SectionData> => {
    const result = {} as Record<SearchSectionType, SectionData>;

    SEARCH_SECTION_IDS.forEach(id => {
      const sectionState = sections?.[id];
      result[id] = {
        items: sectionState?.items || [],
        isLoading: sectionState?.isLoading || false,
        currentPage: sectionState?.currentPage || 1,
        hasMore: sectionState?.hasMore || false,
        hasError: sectionState?.hasError || false,
        isCancelled: sectionState?.isCancelled || false,
      };
    });

    return result;
  },
);

export const selectSearchIsLoading = (state: RootState) => {
  // Check if any section is loading
  if (!state.search?.sections) return false;
  return SEARCH_SECTION_IDS.some(id => state.search.sections[id]?.isLoading);
};
export const selectSearchIsCompleted = (state: RootState) =>
  state.search?.isSearchCompleted || false;
export const selectSearchQuery = (state: RootState) => state.search?.query || '';
