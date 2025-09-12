import React, { useCallback, useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks';
import { useChatWindowContext } from '@/context';
import { AppState, Platform } from 'react-native';
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
import { getGroupedMessages, isAnEmailChannel } from '@/utils';
import { MessagesList } from './MessagesList';
import tailwind from 'twrnc';
import { conversationParticipantActions } from '@/store/conversation-participant/conversationParticipantActions';
import { MESSAGE_TYPES, SCREENS } from '@/constants';
import { Message } from '@/types';
import { selectInboxById } from '@/store/inbox/inboxSelectors';
import { selectUserId } from '@/store/auth/authSelectors';
import { getCurrentRouteName } from '@/utils/navigationUtils';

type DateSeparator = { date: string; type: 'date' };
type MessageOrDate = Message | DateSeparator;

/**
 * Determines if a message should be grouped with the next message and previous message
 * @param {Number} index - Index of the current message
 * @param {Array} searchList - Array of messages to check
 * @returns {Boolean} - Whether the message should be grouped with next
 */
const shouldGroupWithNext = (index: number, searchList: MessageOrDate[]) => {
  if (index < 0) return false;

  if (index === searchList.length - 1) return false;

  const current = searchList[index];
  const next = searchList[index + 1];

  if ('date' in current) return false;
  if ('date' in next) return false;

  if (!current.id || !next.id) return false;

  if (next.status === 'failed') return false;

  const nextSenderId = next.senderId ?? next.sender?.id;
  const currentSenderId = current.senderId ?? current.sender?.id;
  const hasSameSender = nextSenderId === currentSenderId;

  const nextMessageType = next.messageType;
  const currentMessageType = current.messageType;

  const areBothTemplates =
    nextMessageType === MESSAGE_TYPES.TEMPLATE && currentMessageType === MESSAGE_TYPES.TEMPLATE;

  if (!hasSameSender || areBothTemplates) return false;

  if (currentMessageType !== nextMessageType) return false;

  // Check if messages are in the same minute by rounding down to nearest minute
  return Math.floor(next.createdAt / 60) === Math.floor(current.createdAt / 60);
};

const PlatformSpecificKeyboardWrapperComponent =
  Platform.OS === 'android' ? Animated.View : KeyboardGestureArea;

export const MessagesListContainer = () => {
  const [appState, setAppState] = useState(AppState.currentState);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      dispatch(
        conversationActions.fetchPreviousMessages({
          conversationId,
          beforeId,
        }),
      );
    },
    [conversationId, dispatch, lastMessageId],
  );

  // Update messages when app comes to foreground from background
  useEffect(() => {
    const appStateListener = AppState.addEventListener('change', nextAppState => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        const routeName = getCurrentRouteName();
        if (routeName && SCREENS.CHAT === routeName) {
          dispatch(
            conversationActions.fetchPreviousMessages({
              conversationId,
            }),
          );
        }
      }
      setAppState(nextAppState);
    });
    return () => {
      appStateListener?.remove();
    };
  }, [appState, conversationId, dispatch]);

  const onEndReached = () => {
    const shouldFetchMoreMessages = !isAllMessagesFetched && !isLoadingMessages && isFlashListReady;
    if (shouldFetchMoreMessages) {
      loadMessages({ loadingMessagesForFirstTime: false });
    }
  };

  useEffect(() => {
    loadMessages({ loadingMessagesForFirstTime: true });
    dispatch(conversationParticipantActions.index({ conversationId }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const groupedMessages = getGroupedMessages(messages);

  const allMessages = flatMap(groupedMessages, section => [
    ...section.data,
    { date: section.date },
  ]);

  const messagesWithGrouping = allMessages.map((message, index) => {
    return {
      ...message,
      groupWithNext: shouldGroupWithNext(index, allMessages as MessageOrDate[]),
      groupWithPrevious: shouldGroupWithNext(index - 1, allMessages as MessageOrDate[]),
    };
  });

  const { inboxId } = conversation || {};
  const inbox = useAppSelector(state => (inboxId ? selectInboxById(state, inboxId) : undefined));
  const isEmailInbox = isAnEmailChannel(inbox);
  const userId = useAppSelector(selectUserId);

  return (
    <PlatformSpecificKeyboardWrapperComponent
      style={tailwind.style('flex-1 bg-white')}
      interpolator="linear">
      <MessagesList
        messages={messagesWithGrouping}
        isFlashListReady={isFlashListReady}
        setFlashListReady={setFlashListReady}
        onEndReached={onEndReached}
        isEmailInbox={isEmailInbox}
        currentUserId={userId as number}
      />
    </PlatformSpecificKeyboardWrapperComponent>
  );
};
