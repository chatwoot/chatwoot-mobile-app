import { apiService } from '@/services/APIService';
import type { ContactLabelsAPIResponse, ContactLabelsPayload } from './contactTypes';

export class ContactService {
  static async getContactLabels(payload: ContactLabelsPayload) {
    const { contactId } = payload;
    return apiService.get<ContactLabelsAPIResponse>(`contacts/${contactId}/labels`);
  }
}
