import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { searchSection } from './searchActions';
import { SEARCH_SECTION_IDS, type SearchItem, type SearchSectionType } from './searchTypes';

export interface SectionState {
  items: SearchItem[];
  isLoading: boolean;
  currentPage: number;
  hasMore: boolean;
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
      if (state.sections) {
        Object.keys(state.sections).forEach(sectionId => {
          const section = state.sections[sectionId as SearchSectionType];
          if (section) {
            section.items = [];
            section.isLoading = false;
            section.currentPage = 1;
            section.hasMore = false;
          }
        });
      }
      state.isSearchCompleted = false;
      state.query = '';
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
          // Reset to page 1 if this is a new search (page 1 in payload)
          if (actionMeta.meta.arg.page === 1) {
            sectionState.currentPage = 1;
          }
        }
      })
      .addCase(searchSection.fulfilled, (state, actionMeta) => {
        const sectionId = actionMeta.meta.arg.sectionId;
        const sectionState = state.sections[sectionId];
        if (sectionState) {
          sectionState.isLoading = false;
          const page = actionMeta.meta.arg.page || 1;
          const items = actionMeta.payload.items;

          // If page is 1, replace results; otherwise append
          if (page === 1) {
            sectionState.items = items;
          } else {
            sectionState.items = [...sectionState.items, ...items];
          }
          sectionState.currentPage = page + 1;
          sectionState.hasMore = items.length >= 15;

          // Mark search as completed if all sections are done loading
          const allSectionsDone = SEARCH_SECTION_IDS.every(id => !state.sections[id].isLoading);
          if (allSectionsDone) {
            state.isSearchCompleted = true;
          }
        }
      })
      .addCase(searchSection.rejected, (state, actionMeta) => {
        const sectionId = actionMeta.meta.arg.sectionId;
        const sectionState = state.sections[sectionId];
        if (sectionState) {
          sectionState.isLoading = false;

          // Mark search as completed if all sections are done loading
          const allSectionsDone = SEARCH_SECTION_IDS.every(id => !state.sections[id].isLoading);
          if (allSectionsDone) {
            state.isSearchCompleted = true;
          }
        }
      });
  },
});

export const { clearSearchResults, setQuery } = searchSlice.actions;
export default searchSlice.reducer;
