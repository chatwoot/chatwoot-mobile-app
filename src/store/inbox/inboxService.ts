import { apiService } from '@/services/APIService';
import type { InboxResponse } from './inboxTypes';

export class InboxService {
  static async getInboxes(): Promise<InboxResponse> {
    const response = await apiService.get<InboxResponse>('inboxes');
    return response.data;
  }
}
