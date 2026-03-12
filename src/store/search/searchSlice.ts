import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { searchSection } from './searchActions';
import { SEARCH_SECTION_IDS, type SearchItem, type SearchSectionType } from './searchTypes';

export interface SectionState {
  items: SearchItem[];
  isLoading: boolean;
  currentPage: number;
  hasMore: boolean;
  hasError: boolean;
  isCancelled: boolean;
}

export interface SearchState {
  sections: Record<SearchSectionType, SectionState>;
  isLoading: boolean;
  isSearchCompleted: boolean;
  query: string;
}

const createInitialSectionState = (): SectionState => ({
  items: [],
  isLoading: false,
  currentPage: 1,
  hasMore: false,
  hasError: false,
  isCancelled: false,
});

const createInitialSections = (): Record<SearchSectionType, SectionState> => {
  const sections = {} as Record<SearchSectionType, SectionState>;
  SEARCH_SECTION_IDS.forEach(id => {
    sections[id] = createInitialSectionState();
  });
  return sections;
};

const initialState: SearchState = {
  sections: createInitialSections(),
  isLoading: false,
  isSearchCompleted: false,
  query: '',
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    clearSearchResults: state => {
      Object.keys(state.sections).forEach(sectionId => {
        const section = state.sections[sectionId as SearchSectionType];
        if (section) {
          section.items = [];
          section.isLoading = false;
          section.currentPage = 1;
          section.hasMore = false;
          section.hasError = false;
          section.isCancelled = false;
        }
      });
      state.isSearchCompleted = false;
      state.query = '';
    },
    prepareNewSearch: state => {
      Object.keys(state.sections).forEach(sectionId => {
        const section = state.sections[sectionId as SearchSectionType];
        if (section) {
          section.items = [];
          section.isLoading = true;
          section.currentPage = 1;
          section.hasMore = false;
          section.hasError = false;
          section.isCancelled = false;
        }
      });
      state.isSearchCompleted = false;
    },
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(searchSection.pending, (state, actionMeta) => {
        const sectionId = actionMeta.meta.arg.sectionId;
        const sectionState = state.sections[sectionId];
        if (sectionState) {
          sectionState.isLoading = true;
          sectionState.hasError = false;
          sectionState.isCancelled = false;
          state.isSearchCompleted = false;
          if (actionMeta.meta.arg.page === 1) {
            sectionState.currentPage = 1;
          }
        }
      })
      .addCase(searchSection.fulfilled, (state, actionMeta) => {
        const sectionId = actionMeta.meta.arg.sectionId;
        const sectionState = state.sections[sectionId];
        if (!sectionState) return;

        // Discard stale responses — section is still loading for the current query
        if (actionMeta.meta.arg.q !== state.query) return;

        sectionState.isLoading = false;

        const page = actionMeta.meta.arg.page || 1;
        const items = actionMeta.payload.items;

        if (page === 1) {
          sectionState.items = items;
        } else {
          sectionState.items = [...sectionState.items, ...items];
        }
        sectionState.currentPage = page + 1;
        sectionState.hasMore = items.length >= 15;

        const allSectionsDone = SEARCH_SECTION_IDS.every(id => !state.sections[id].isLoading);
        if (allSectionsDone) {
          state.isSearchCompleted = true;
        }
      })
      .addCase(searchSection.rejected, (state, actionMeta) => {
        const sectionId = actionMeta.meta.arg.sectionId;
        const sectionState = state.sections[sectionId];
        if (!sectionState) return;

        // For aborted requests (e.g. user navigated away), stop loading
        // but don't mark as error so the section stays in its current state
        if (actionMeta.meta.aborted) {
          sectionState.isLoading = false;
          if (sectionState.items.length === 0) {
            sectionState.isCancelled = true;
          }
          return;
        }

        // Discard stale responses — section is still loading for the current query
        if (actionMeta.meta.arg.q !== state.query) return;

        sectionState.isLoading = false;
        sectionState.hasError = true;

        const allSectionsDone = SEARCH_SECTION_IDS.every(id => !state.sections[id].isLoading);
        if (allSectionsDone) {
          state.isSearchCompleted = true;
        }
      });
  },
});

export const { clearSearchResults, prepareNewSearch, setQuery } = searchSlice.actions;
export default searchSlice.reducer;
