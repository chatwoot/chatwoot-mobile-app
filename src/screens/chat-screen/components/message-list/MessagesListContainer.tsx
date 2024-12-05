import React, { useCallback, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks';
import { useChatWindowContext } from '@/context';
import { Platform } from 'react-native';
import { KeyboardGestureArea } from 'react-native-keyboard-controller';
import { flatMap } from 'lodash';
import useDeepCompareEffect from 'use-deep-compare-effect';
import {
  getMessagesByConversationId,
  selectConversationById,
  selectIsAllMessagesFetched,
  selectIsLoadingMessages,
} from '@/store/conversation/conversationSelectors';
import { conversationActions } from '@/store/conversation/conversationActions';
import { selectAttachments } from '@/store/conversation/sendMessageSlice';
import { Animated } from 'react-native';
import { getGroupedMessages } from '@/utils';
import { MessagesList } from './MessagesList';
import tailwind from 'twrnc';

const PlatformSpecificKeyboardWrapperComponent =
  Platform.OS === 'android' ? Animated.View : KeyboardGestureArea;

export const MessagesListContainer = () => {
  const { conversationId } = useChatWindowContext();
  const dispatch = useAppDispatch();
  const [isFlashListReady, setFlashListReady] = React.useState(false);

  const conversation = useAppSelector(state => selectConversationById(state, conversationId));
  const isAllMessagesFetched = useAppSelector(selectIsAllMessagesFetched);
  const isLoadingMessages = useAppSelector(selectIsLoadingMessages);
  const messages = useAppSelector(state => getMessagesByConversationId(state, { conversationId }));
  const attachments = useAppSelector(selectAttachments);

  const { setAddMenuOptionSheetState } = useChatWindowContext();

  useDeepCompareEffect(() => {
    setAddMenuOptionSheetState(false);
  }, [attachments]);

  useEffect(() => {
    if (conversation) {
      dispatch(conversationActions.markMessageRead({ conversationId }));
    }
  }, []);

  const lastMessageId = useCallback(() => {
    if (messages && messages.length) {
      const lastMessage = messages[messages.length - 1];
      return lastMessage.id;
    }
    return null;
  }, [messages]);

  const loadMessages = useCallback(
    async ({ loadingMessagesForFirstTime = false }) => {
      const beforeId = loadingMessagesForFirstTime ? null : lastMessageId();
      if (!conversation) {
        await dispatch(conversationActions.fetchConversation(conversationId));
      }
      dispatch(
        conversationActions.fetchPreviousMessages({
          conversationId,
          beforeId,
        }),
      );
    },
    [conversation, conversationId, dispatch, lastMessageId],
  );

  const onEndReached = () => {
    const shouldFetchMoreMessages = !isAllMessagesFetched && !isLoadingMessages && isFlashListReady;
    if (shouldFetchMoreMessages) {
      loadMessages({ loadingMessagesForFirstTime: false });
    }
  };

  useEffect(() => {
    loadMessages({ loadingMessagesForFirstTime: true });
  }, []);

  const groupedMessages = getGroupedMessages(messages);
  const allMessages = flatMap(groupedMessages, section => [
    ...section.data,
    { date: section.date },
  ]);

  return (
    <PlatformSpecificKeyboardWrapperComponent
      style={tailwind.style('flex-1 bg-white')}
      interpolator="linear">
      <MessagesList
        messages={allMessages}
        isFlashListReady={isFlashListReady}
        setFlashListReady={setFlashListReady}
        onEndReached={onEndReached}
      />
    </PlatformSpecificKeyboardWrapperComponent>
  );
};
