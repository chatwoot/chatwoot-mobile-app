import type { ComponentType } from 'react';
import type { NavigationProp } from '@react-navigation/native';

import type { Contact } from '@/types/Contact';
import type { Conversation } from '@/types/Conversation';
import type { Message } from '@/types/Message';
import {
  SearchResultContactItem,
  SearchResultConversationItem,
  SearchResultMessageItem,
} from '@/screens/search/components';
import { transformContact, transformMessage } from '@/utils/camelCaseKeys';
import { transformSearchConversation } from './utils/transformers';
import {
  getContactAdditionalData,
  handleContactPress,
  handleConversationPress,
  handleMessagePress,
} from './utils/handlers';
import type { AppDispatch } from '@/store';

export type SearchSectionType = 'contacts' | 'conversations' | 'messages';

export interface SearchSectionConfig {
  id: SearchSectionType;
  label: string;
  apiEndpoint: string;
  dataKey: string[];
  transformResponse: (data: any) => any[];
  renderComponent: ComponentType<any>;
  getId: (item: any) => string | number;
  getItemId: (item: any) => string | number;
  onPress: (
    navigation: NavigationProp<any>,
    item: Contact | Conversation | Message,
    dispatch?: AppDispatch,
    additionalData?: Record<string, any>,
  ) => void | Promise<void>;
  getAdditionalData?: (
    item: Contact | Conversation | Message,
    allSectionsData: Record<SearchSectionType, (Contact | Conversation | Message)[]>,
  ) => Record<string, any>;
}

export const SEARCH_SECTIONS: SearchSectionConfig[] = [
  {
    id: 'contacts',
    label: 'Contacts',
    apiEndpoint: 'search/contacts',
    dataKey: ['payload', 'contacts'],
    transformResponse: (data: any) => {
      const contacts = data.payload?.contacts || [];
      return contacts.map(transformContact);
    },
    renderComponent: SearchResultContactItem,
    getId: (item: Contact) => item.id,
    getItemId: (item: Contact) => item.id,
    getAdditionalData: (item, allSectionsData) =>
      getContactAdditionalData(item as Contact, allSectionsData),
    onPress: (navigation, item, dispatch) =>
      handleContactPress(navigation, item as Contact, dispatch),
  },
  {
    id: 'conversations',
    label: 'Conversations',
    apiEndpoint: 'search/conversations',
    dataKey: ['payload', 'conversations'],
    transformResponse: (data: any) => {
      const conversations = data.payload?.conversations || [];
      return conversations.map(transformSearchConversation);
    },
    renderComponent: SearchResultConversationItem,
    getId: (item: Conversation) => item.id,
    getItemId: (item: Conversation) => item.id,
    onPress: (navigation, item) => handleConversationPress(navigation, item as Conversation),
  },
  {
    id: 'messages',
    label: 'Messages',
    apiEndpoint: 'search/messages',
    dataKey: ['payload', 'messages'],
    transformResponse: (data: any) => {
      const messages = data.payload?.messages || [];
      return messages.map(transformMessage);
    },
    renderComponent: SearchResultMessageItem,
    getId: (item: Message) => item.id,
    getItemId: (item: Message) => item.id,
    onPress: (navigation, item) => handleMessagePress(navigation, item as Message),
  },
];

export const getSearchSectionById = (id: SearchSectionType): SearchSectionConfig | undefined => {
  return SEARCH_SECTIONS.find(section => section.id === id);
};

export const getSearchSectionIds = (): SearchSectionType[] => {
  return SEARCH_SECTIONS.map(section => section.id);
};
