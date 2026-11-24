import { apiService } from '@/services/APIService';
import type { AccountAPIResponse, AccountResponse } from './accountTypes';

export class AccountService {
  static async show(): Promise<AccountResponse> {
    // An empty path resolves to the active account itself: api/v1/accounts/:id/
    const response = await apiService.get<AccountAPIResponse>('');
    const { features, settings } = response.data;
    return {
      features: features || {},
      conversationRequiredAttributes: settings?.conversation_required_attributes || [],
    };
  }
}
