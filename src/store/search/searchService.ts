import { apiService } from '@/services/APIService';
import type { SearchItem, SearchPayload } from './searchTypes';
import type { AxiosRequestConfig } from 'axios';

export interface SearchSectionResponse {
  items: SearchItem[];
}

export class SearchService {
  static async searchSection(
    apiEndpoint: string,
    transformResponse: (data: unknown) => SearchItem[],
    payload: SearchPayload,
    signal?: AbortSignal,
  ): Promise<SearchSectionResponse> {
    const { q, page = 1 } = payload;
    const response = await apiService.get(apiEndpoint, {
      params: { q, page },
      signal,
    } as AxiosRequestConfig);

    const transformedItems = transformResponse(response.data);

    return {
      items: transformedItems || [],
    };
  }
}
