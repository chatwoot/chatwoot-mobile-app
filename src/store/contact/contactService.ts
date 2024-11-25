import { apiService } from '@/services/APIService';
import type { ContactLabelsAPIResponse, ContactLabelsPayload } from './contactTypes';

export class ContactService {
  static async getContactLabels(payload: ContactLabelsPayload): Promise<ContactLabelsAPIResponse> {
    const { contactId } = payload;
    const response = await apiService.get<ContactLabelsAPIResponse>(`contacts/${contactId}/labels`);
    return response.data;
  }
}
