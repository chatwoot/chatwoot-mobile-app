import { useAppDispatch, useAppSelector } from '@/hooks';
import { selectUserId } from '@/store/auth/authSelectors';
import { contactConversationActions } from '@/store/contact/contactConversationActions';
import { conversationActions } from '@/store/conversation/conversationActions';
import { logger } from '@/utils/logger';
import { useCallback, useState } from 'react';

interface UseContactLinkingOptions {
  onContactChange?: (contactId: number | null) => void;
}

interface UseContactLinkingResult {
  linkContact: boolean;
  selectedContactId: number | null;
  useContactNameAsTitle: boolean;
  setLinkContact: (value: boolean) => void;
  setSelectedContactId: (id: number | null) => void;
  setUseContactNameAsTitle: (value: boolean) => void;
  getConversationIdForContact: (contactId: number) => Promise<number | undefined>;
}

export function useContactLinking({ onContactChange }: UseContactLinkingOptions = {}): UseContactLinkingResult {
  const dispatch = useAppDispatch();
  const currentUserId = useAppSelector(selectUserId);
  const [linkContact, setLinkContact] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<number | null>(null);
  const [useContactNameAsTitle, setUseContactNameAsTitle] = useState(false);

  const handleSetSelectedContactId = useCallback(
    (id: number | null) => {
      setSelectedContactId(id);
      if (onContactChange) {
        onContactChange(id);
      }
    },
    [onContactChange],
  );

  const getConversationIdForContact = useCallback(
    async (contactId: number): Promise<number | undefined> => {
      try {
        const contactConversationsResult = await dispatch(
          contactConversationActions.getContactConversations({ contactId }),
        ).unwrap();

        const openConversation = contactConversationsResult.conversations.find(
          conv => conv.status === 'open',
        );

        const conversationId = openConversation
          ? openConversation.id
          : contactConversationsResult.conversations[0]?.id;

        if (conversationId && currentUserId) {
          try {
            await dispatch(
              conversationActions.assignConversation({
                conversationId,
                assigneeId: currentUserId,
              }),
            ).unwrap();
          } catch (assignError) {
            logger.error('Error assigning conversation to agent:', assignError);
          }
        }

        return conversationId;
      } catch (error) {
        logger.error('Error fetching contact conversations:', error);
        return undefined;
      }
    },
    [dispatch, currentUserId],
  );

  return {
    linkContact,
    selectedContactId,
    useContactNameAsTitle,
    setLinkContact,
    setSelectedContactId: handleSetSelectedContactId,
    setUseContactNameAsTitle,
    getConversationIdForContact,
  };
}
