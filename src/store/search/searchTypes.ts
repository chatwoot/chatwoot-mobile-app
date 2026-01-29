import type { Contact } from '@/types/Contact';
import type { Conversation } from '@/types/Conversation';
import type { Message } from '@/types/Message';

export interface SearchPayload {
  q: string;
  page?: number;
}

export interface SearchContactsAPIResponse {
  payload: {
    contacts: Contact[];
  };
}

export interface SearchConversationsAPIResponse {
  payload: {
    conversations: Conversation[];
  };
}

export interface SearchMessagesAPIResponse {
  payload: {
    messages: Message[];
  };
}

export interface SearchContactsResponse {
  contacts: Contact[];
}

export interface SearchConversationsResponse {
  conversations: Conversation[];
}

export interface SearchMessagesResponse {
  messages: Message[];
}

export interface SearchResult {
  type: 'contact' | 'conversation' | 'message';
  data: Contact | Conversation | Message;
}
