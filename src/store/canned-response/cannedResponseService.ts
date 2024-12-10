import { apiService } from '@/services/APIService';
import type { CannedResponseResponse } from './cannedResponseTypes';
import { transformCannedResponse } from '@/utils/camelCaseKeys';
import { CannedResponse } from '@/types';

export class CannedResponseService {
  static async index(searchKey: string): Promise<CannedResponseResponse> {
    const url = searchKey ? `canned_responses?search=${searchKey}` : 'canned_responses';
    const response = await apiService.get<CannedResponse[]>(url);
    const cannedResponses = response.data.map(transformCannedResponse);
    return {
      payload: cannedResponses,
    };
  }
}
