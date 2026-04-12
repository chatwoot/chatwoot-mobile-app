import type { ComponentType } from 'react';
import type { NavigationProp } from '@react-navigation/native';

import type { Contact } from '@/types/Contact';
import type { Conversation } from '@/types/Conversation';
import type { Message } from '@/types/Message';
import { SearchResultContactItem } from '@/screens/search/components/result-items/SearchResultContactItem';
import { SearchResultConversationItem } from '@/screens/search/components/result-items/SearchResultConversationItem';
import { SearchResultMessageItem } from '@/screens/search/components/result-items/SearchResultMessageItem';
import { transformContact, transformMessage } from '@/utils/camelCaseKeys';
import { transformSearchConversation } from './utils/transformers';
import {
  getContactAdditionalData,
  handleContactPress,
  handleConversationPress,
  handleMessagePress,
} from './utils/handlers';
import type { AppDispatch } from '@/store';
import type { SearchItem, SearchSectionType } from '@/store/search/searchTypes';
import type { TabBarExcludedScreenParamList } from '@/navigation/tabs/AppTabs';

export interface SearchSectionConfig {
  id: SearchSectionType;
  labelKey: string;
  apiEndpoint: string;
  dataKey: string[];
  transformResponse: (data: unknown) => SearchItem[];
  renderComponent: ComponentType<Record<string, unknown>>;
  getId: (item: SearchItem) => string | number;
  getItemId: (item: SearchItem) => string | number;
  onPress: (
    navigation: NavigationProp<TabBarExcludedScreenParamList>,
    item: SearchItem,
    dispatch?: AppDispatch,
    additionalData?: Record<string, unknown>,
  ) => void | Promise<void>;
  getAdditionalData?: (
    item: SearchItem,
    allSectionsData: Record<SearchSectionType, SearchItem[]>,
  ) => Record<string, unknown>;
}

export const SEARCH_SECTIONS: SearchSectionConfig[] = [
  {
    id: 'contacts',
    labelKey: 'SEARCH.SECTIONS.CONTACTS',
    apiEndpoint: 'search/contacts',
    dataKey: ['payload', 'contacts'],
    transformResponse: (data: unknown) => {
      const contacts = (data as { payload?: { contacts?: Contact[] } }).payload?.contacts || [];
      return contacts.map(transformContact);
    },
    renderComponent: SearchResultContactItem as ComponentType<Record<string, unknown>>,
    getId: (item: SearchItem) => (item as Contact).id,
    getItemId: (item: SearchItem) => (item as Contact).id,
    getAdditionalData: (item, allSectionsData) =>
      getContactAdditionalData(item as Contact, allSectionsData),
    onPress: (navigation, item, dispatch) =>
      handleContactPress(navigation, item as Contact, dispatch),
  },
  {
    id: 'conversations',
    labelKey: 'SEARCH.SECTIONS.CONVERSATIONS',
    apiEndpoint: 'search/conversations',
    dataKey: ['payload', 'conversations'],
    transformResponse: (data: unknown) => {
      const conversations =
        (data as { payload?: { conversations?: Conversation[] } }).payload?.conversations || [];
      return conversations.map(transformSearchConversation);
    },
    renderComponent: SearchResultConversationItem as ComponentType<Record<string, unknown>>,
    getId: (item: SearchItem) => (item as Conversation).id,
    getItemId: (item: SearchItem) => (item as Conversation).id,
    onPress: (navigation, item) => handleConversationPress(navigation, item as Conversation),
  },
  {
    id: 'messages',
    labelKey: 'SEARCH.SECTIONS.MESSAGES',
    apiEndpoint: 'search/messages',
    dataKey: ['payload', 'messages'],
    transformResponse: (data: unknown) => {
      const messages = (data as { payload?: { messages?: Message[] } }).payload?.messages || [];
      return messages.map(transformMessage);
    },
    renderComponent: SearchResultMessageItem as ComponentType<Record<string, unknown>>,
    getId: (item: SearchItem) => (item as Message).id,
    getItemId: (item: SearchItem) => (item as Message).id,
    onPress: (navigation, item) => handleMessagePress(navigation, item as Message),
  },
];

export const getSearchSectionById = (id: SearchSectionType): SearchSectionConfig | undefined => {
  return SEARCH_SECTIONS.find(section => section.id === id);
};

export const getSearchSectionIds = (): SearchSectionType[] => {
  return SEARCH_SECTIONS.map(section => section.id);
};
