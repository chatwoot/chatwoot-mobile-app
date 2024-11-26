import { apiService } from '@/services/APIService';
import type { InboxResponse } from './inboxTypes';
import { transformInbox } from '@/utils/camelCaseKeys';

export class InboxService {
  static async index(): Promise<InboxResponse> {
    const response = await apiService.get<InboxResponse>('inboxes');
    const inboxes = response.data.payload.map(transformInbox);
    return {
      payload: inboxes,
    };
  }
}