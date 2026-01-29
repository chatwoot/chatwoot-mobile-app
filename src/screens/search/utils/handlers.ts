import type { NavigationProp } from '@react-navigation/native';
import { StackActions } from '@react-navigation/native';

import type { Contact } from '@/types/Contact';
import type { Conversation } from '@/types/Conversation';
import type { Message } from '@/types/Message';
import type { SearchSectionType } from '@/screens/search/config';
import { transformContact } from '@/utils/camelCaseKeys';
import { addContact } from '@/store/contact/contactSlice';
import { apiService } from '@/services/APIService';
import type { AppDispatch } from '@/store';

/**
 * Get additional data for contact items (finds related conversation)
 */
export function getContactAdditionalData(
  item: Contact,
  allSectionsData: Record<SearchSectionType, (Contact | Conversation | Message)[]>,
): Record<string, any> {
  const conversationsItems = allSectionsData.conversations || [];
  const relatedConversation = conversationsItems.find(
    (conv): conv is Conversation => {
      const conversation = conv as Conversation;
      return conversation.meta?.sender?.id === item.id;
    },
  );
  return { conversationId: relatedConversation?.id };
}

/**
 * Handle contact item press - fetches full contact details and navigates
 */
export async function handleContactPress(
  navigation: NavigationProp<any>,
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

  try {
    const response = await apiService.get<{ payload: any }>(`contacts/${contactId}`);
    const transformedContact = transformContact(response.data.payload);
    if (dispatch) {
      dispatch(addContact(transformedContact));
    }
  } catch (error) {
    console.error('Failed to fetch contact details:', error);
  }

  const pushToContactDetails = StackActions.push('ContactDetails', {
    contactId: contactId,
  });
  navigation.dispatch(pushToContactDetails);
}

/**
 * Handle conversation item press - navigates to chat screen
 */
export function handleConversationPress(
  navigation: NavigationProp<any>,
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
export function handleMessagePress(navigation: NavigationProp<any>, item: Message): void {
  const pushToChatScreen = StackActions.push('ChatScreen', {
    conversationId: item.conversationId,
    isConversationOpenedExternally: false,
    messageId: item.id,
  });
  navigation.dispatch(pushToChatScreen);
}
