import { apiService } from '@/services/APIService';
import type {
  ContactLabelsAPIResponse,
  ContactLabelsPayload,
  UpdateContactLabelsPayload,
  ContactConversationAPIResponse,
  ContactConversationPayload,
} from './contactTypes';
import { transformConversation } from '@/utils/camelCaseKeys';

export class ContactService {
  static async getContactLabels(payload: ContactLabelsPayload) {
    const { contactId } = payload;
    const response = await apiService.get<ContactLabelsAPIResponse>(`contacts/${contactId}/labels`);
    return response.data;
  }

  static async updateContactLabels(
    payload: UpdateContactLabelsPayload,
  ): Promise<ContactLabelsAPIResponse> {
    const { contactId, labels } = payload;
    const response = await apiService.put<ContactLabelsAPIResponse>(
      `contacts/${contactId}/labels`,
      { labels },
    );
    return response.data;
  }

  static async getContactConversations(
    payload: ContactConversationPayload,
  ): Promise<ContactConversationAPIResponse> {
    const { contactId } = payload;
    const response = await apiService.get<ContactConversationAPIResponse>(
      `contacts/${contactId}/conversations`,
    );
    const transformedResponse = response.data.payload.map(transformConversation);
    return {
      payload: transformedResponse,
    };
  }
}
