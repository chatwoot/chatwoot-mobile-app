import { apiService } from '@/services/APIService';
import type {
  ContactListAPIResponse,
  ContactListPayload,
  ContactAPIResponse,
  ContactLabelsAPIResponse,
  ContactLabelsPayload,
  UpdateContactLabelsPayload,
  ContactConversationAPIResponse,
  ContactConversationPayload,
  ContactableInboxAPIResponse,
  ContactableInboxResponse,
  ContactNoteAPIResponse,
  ContactNotePayload,
  ContactNotesAPIResponse,
  CreateContactAPIResponse,
  CreateContactPayload,
  CreateContactNotePayload,
  DeleteContactNotePayload,
  MergeContactsPayload,
  StartContactCallPayload,
  UpdateContactNotePayload,
} from './contactTypes';
import { transformContact, transformConversation, transformInbox } from '@/utils/camelCaseKeys';
import camelcaseKeys from 'camelcase-keys';
import type { AxiosRequestConfig } from 'axios';

const transformContactNoteResponse = <T>(data: T): T => {
  return camelcaseKeys(data as Record<string, unknown>, { deep: true }) as T;
};

const normalizeContactNotesResponse = (
  data: ContactNotesAPIResponse | ContactNotesAPIResponse['payload'],
): ContactNotesAPIResponse => {
  const transformedResponse = transformContactNoteResponse(data);
  return Array.isArray(transformedResponse)
    ? { payload: transformedResponse }
    : { payload: transformedResponse.payload || [] };
};

const normalizeContactNoteResponse = (
  data: ContactNoteAPIResponse | ContactNoteAPIResponse['payload'],
): ContactNoteAPIResponse => {
  const transformedResponse = transformContactNoteResponse(data);
  return 'payload' in transformedResponse ? transformedResponse : { payload: transformedResponse };
};

export class ContactService {
  static async getContact(contactId: number) {
    const response = await apiService.get<ContactAPIResponse>(`contacts/${contactId}`, {
      params: {
        include_contact_inboxes: false,
      },
    } as AxiosRequestConfig);

    return transformContact(response.data.payload);
  }

  static async getContacts(payload: ContactListPayload = {}): Promise<ContactListAPIResponse> {
    const { page = 1, query = '', sort = 'name' } = payload;
    const trimmedQuery = query.trim();
    const response = await apiService.get<ContactListAPIResponse>(
      trimmedQuery ? 'contacts/search' : 'contacts',
      {
        params: {
          include_contact_inboxes: false,
          page,
          sort,
          ...(trimmedQuery ? { q: trimmedQuery } : {}),
        },
      } as AxiosRequestConfig,
    );

    return {
      meta: camelcaseKeys(response.data.meta || {}, {
        deep: true,
      }) as ContactListAPIResponse['meta'],
      payload: (response.data.payload || []).map(transformContact),
    };
  }

  static async createContact(payload: CreateContactPayload) {
    const { companyId, email, name, phoneNumber } = payload;
    const requestPayload = {
      name,
      ...(phoneNumber ? { phone_number: phoneNumber } : {}),
      ...(email ? { email } : {}),
      ...(companyId ? { company_id: companyId } : {}),
    };
    const response = await apiService.post<CreateContactAPIResponse>('contacts', requestPayload);

    return transformContact(response.data.payload.contact);
  }

  static async getContactLabels(payload: ContactLabelsPayload) {
    const { contactId } = payload;
    const response = await apiService.get<ContactLabelsAPIResponse>(`contacts/${contactId}/labels`);
    return response.data;
  }

  static async updateContactLabels(
    payload: UpdateContactLabelsPayload,
  ): Promise<ContactLabelsAPIResponse> {
    const { contactId, labels } = payload;
    const response = await apiService.post<ContactLabelsAPIResponse>(
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

  static async getContactableInboxes(contactId: number): Promise<ContactableInboxResponse> {
    const response = await apiService.get<ContactableInboxAPIResponse>(
      `contacts/${contactId}/contactable_inboxes`,
    );
    const payload = camelcaseKeys(response.data.payload || [], { deep: true });

    return {
      payload: payload.map(contactableInbox => ({
        ...transformInbox(contactableInbox.inbox),
        sourceId: contactableInbox.sourceId,
      })),
    };
  }

  static async getContactNotes(payload: ContactNotePayload): Promise<ContactNotesAPIResponse> {
    const { contactId } = payload;
    const response = await apiService.get<
      ContactNotesAPIResponse | ContactNotesAPIResponse['payload']
    >(`contacts/${contactId}/notes`);
    return normalizeContactNotesResponse(response.data);
  }

  static async createContactNote(
    payload: CreateContactNotePayload,
  ): Promise<ContactNoteAPIResponse> {
    const { contactId, content } = payload;
    const response = await apiService.post<
      ContactNoteAPIResponse | ContactNoteAPIResponse['payload']
    >(`contacts/${contactId}/notes`, {
      content,
    });
    return normalizeContactNoteResponse(response.data);
  }

  static async updateContactNote(
    payload: UpdateContactNotePayload,
  ): Promise<ContactNoteAPIResponse> {
    const { contactId, noteId, content } = payload;
    const response = await apiService.patch<
      ContactNoteAPIResponse | ContactNoteAPIResponse['payload']
    >(`contacts/${contactId}/notes/${noteId}`, { content });
    return normalizeContactNoteResponse(response.data);
  }

  static async deleteContactNote(
    payload: DeleteContactNotePayload,
  ): Promise<DeleteContactNotePayload> {
    const { contactId, noteId } = payload;
    await apiService.delete(`contacts/${contactId}/notes/${noteId}`);
    return payload;
  }

  static async startContactCall(payload: StartContactCallPayload): Promise<void> {
    const { contactId, inboxId, conversationId } = payload;
    await apiService.post(`contacts/${contactId}/call`, {
      inbox_id: inboxId,
      ...(conversationId ? { conversation_id: conversationId } : {}),
    });
  }

  static async mergeContacts(payload: MergeContactsPayload): Promise<void> {
    const { baseContactId, mergeeContactId } = payload;
    await apiService.post('actions/contact_merge', {
      base_contact_id: baseContactId,
      mergee_contact_id: mergeeContactId,
    });
  }
}
