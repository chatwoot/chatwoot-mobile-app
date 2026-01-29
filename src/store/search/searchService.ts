import { apiService } from '@/services/APIService';
import type { SearchPayload } from './searchTypes';
import type { AxiosRequestConfig } from 'axios';
import { SEARCH_SECTIONS, type SearchSectionType } from '@/screens/search/config';

export interface SearchSectionResponse {
  items: any[];
}

export class SearchService {
  static async searchSection(
    sectionId: SearchSectionType,
    payload: SearchPayload,
  ): Promise<SearchSectionResponse> {
    const section = SEARCH_SECTIONS.find(s => s.id === sectionId);
    if (!section) {
      throw new Error(`Unknown search section: ${sectionId}`);
    }

    const { q, page = 1 } = payload;
    const response = await apiService.get(section.apiEndpoint, {
      params: { q, page },
    } as AxiosRequestConfig);

    const transformedItems = section.transformResponse(response.data);
    
    return {
      items: transformedItems || [],
    };
  }
}
