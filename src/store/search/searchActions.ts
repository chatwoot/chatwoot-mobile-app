import { createAsyncThunk } from '@reduxjs/toolkit';
import { SearchService, type SearchSectionResponse } from './searchService';
import type { SearchPayload } from './searchTypes';
import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/store/conversation/conversationTypes';
import type { SearchSectionType } from './searchTypes';

interface SearchSectionPayload extends SearchPayload {
  sectionId: SearchSectionType;
}

export const searchSection = createAsyncThunk<SearchSectionResponse, SearchSectionPayload>(
  'search/searchSection',
  async ({ sectionId, ...payload }, { rejectWithValue }) => {
    try {
      return await SearchService.searchSection(sectionId, payload);
    } catch (error) {
      const { response } = error as AxiosError<ApiErrorResponse>;
      if (!response) {
        throw error;
      }
      return rejectWithValue(response.data);
    }
  },
);

export const searchActions = {
  searchSection,
};
