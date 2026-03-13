import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { StackActions } from '@react-navigation/native';

import type { Contact } from '@/types/Contact';
import type { Conversation } from '@/types/Conversation';
import type { Message } from '@/types/Message';
import type { SearchItem, SearchSectionType } from '@/store/search/searchTypes';
import { transformContact } from '@/utils/camelCaseKeys';
import { addContact } from '@/store/contact/contactSlice';
import { apiService } from '@/services/APIService';
import type { AppDispatch } from '@/store';

/**
 * Get additional data for contact items (finds related conversation)
 */
export function getContactAdditionalData(
  item: Contact,
  allSectionsData: Record<SearchSectionType, SearchItem[]>,
): Record<string, unknown> {
  const conversationsItems = allSectionsData.conversations || [];
  const relatedConversation = conversationsItems.find((conv): conv is Conversation => {
    const conversation = conv as Conversation;
    return conversation.meta?.sender?.id === item.id;
  });
  return { conversationId: relatedConversation?.id };
}

/**
 * Handle contact item press - fetches full contact details and navigates
 */
export async function handleContactPress(
  navigation: NavigationProp<ParamListBase>,
  item: Contact,
  dispatch?: AppDispatch,
): Promise<void> {
  if (!navigation || !navigation.dispatch) {
    return;
  }

  const contactId = item?.id;
  if (!contactId) {
    return;
  }

  if (dispatch && item) {
    dispatch(addContact(item));
  }

  // Navigate immediately with the search result data already in the store,
  // then fetch full contact details in the background to enrich the screen
  const pushToContactDetails = StackActions.push('ContactDetails', {
    contactId: contactId,
  });
  navigation.dispatch(pushToContactDetails);

  try {
    const response = await apiService.get<{ payload: unknown }>(`contacts/${contactId}`);
    const transformedContact = transformContact(response.data.payload);
    if (dispatch) {
      dispatch(addContact(transformedContact));
    }
  } catch (error) {
    // Navigation already happened with basic contact data from search results
    console.warn('Failed to fetch full contact details:', error);
  }
}

/**
 * Handle conversation item press - navigates to chat screen
 */
export function handleConversationPress(
  navigation: NavigationProp<ParamListBase>,
  item: Conversation,
): void {
  const pushToChatScreen = StackActions.push('ChatScreen', {
    conversationId: item.id,
    isConversationOpenedExternally: false,
  });
  navigation.dispatch(pushToChatScreen);
}

/**
 * Handle message item press - navigates to chat screen with message ID
 */
export function handleMessagePress(navigation: NavigationProp<ParamListBase>, item: Message): void {
  const pushToChatScreen = StackActions.push('ChatScreen', {
    conversationId: item.conversationId,
    isConversationOpenedExternally: false,
    messageId: item.id,
  });
  navigation.dispatch(pushToChatScreen);
}
