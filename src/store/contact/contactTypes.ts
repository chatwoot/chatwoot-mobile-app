import { Contact, Conversation } from '@/types';
import type { Inbox } from '@/types/Inbox';

export interface ContactListPayload {
  page?: number;
  query?: string;
  sort?: string;
}

export interface ContactListAPIResponse {
  meta?: {
    count?: number;
    currentPage?: number;
    hasMore?: boolean;
    nextPage?: number | null;
    totalCount?: number;
    totalPages?: number;
  };
  payload: Contact[];
}

export interface ContactAPIResponse {
  payload: Contact;
}

export interface CreateContactPayload {
  name: string;
  phoneNumber?: string;
  email?: string;
  companyId?: number;
}

export interface CreateContactAPIResponse {
  payload: {
    contact: Contact;
  };
}

export interface ContactLabelsAPIResponse {
  payload: string[];
}

export interface ContactLabelsPayload {
  contactId: number;
}

export interface UpdateContactLabelsPayload {
  contactId: number;
  labels: string[];
}

export interface ContactConversationPayload {
  contactId: number;
}

export interface ContactConversationAPIResponse {
  payload: Conversation[];
}

export type ContactableInbox = Inbox & {
  sourceId: string;
};

export interface ContactableInboxAPIResponse {
  payload: {
    inbox: Inbox;
    sourceId: string;
  }[];
}

export interface ContactableInboxResponse {
  payload: ContactableInbox[];
}

export type ContactNote = {
  id: number;
  content: string;
  createdAt?: number | string;
  updatedAt?: number | string;
  user?: { id: number; name: string };
};

export interface ContactNotesAPIResponse {
  payload: ContactNote[];
}

export interface ContactNoteAPIResponse {
  payload: ContactNote;
}

export interface ContactNotePayload {
  contactId: number;
}

export interface CreateContactNotePayload {
  contactId: number;
  content: string;
}

export interface UpdateContactNotePayload {
  contactId: number;
  noteId: number;
  content: string;
}

export interface DeleteContactNotePayload {
  contactId: number;
  noteId: number;
}

export interface StartContactCallPayload {
  contactId: number;
  inboxId: number;
  conversationId?: number;
}

export interface MergeContactsPayload {
  baseContactId: number;
  mergeeContactId: number;
}
