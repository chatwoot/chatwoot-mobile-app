import { createAsyncThunk } from '@reduxjs/toolkit';
import { SearchService, type SearchSectionResponse } from './searchService';
import type { SearchPayload, SearchItem } from './searchTypes';
import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/store/conversation/conversationTypes';
import type { SearchSectionType } from './searchTypes';

interface SearchSectionPayload extends SearchPayload {
  sectionId: SearchSectionType;
  apiEndpoint: string;
  transformResponse: (data: unknown) => SearchItem[];
}

export const searchSection = createAsyncThunk<SearchSectionResponse, SearchSectionPayload>(
  'search/searchSection',
  async ({ sectionId: _, apiEndpoint, transformResponse, ...payload }, { rejectWithValue }) => {
    try {
      return await SearchService.searchSection(apiEndpoint, transformResponse, payload);
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
