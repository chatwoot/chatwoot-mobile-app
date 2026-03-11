import React, { useCallback, useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks';
import { useChatWindowContext, useRefsContext } from '@/context';
import { AppState, Platform, View, ActivityIndicator } from 'react-native';
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
import { useScrollToMessage } from './useScrollToMessage';
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
  const { conversationId, messageId } = useChatWindowContext();
  const dispatch = useAppDispatch();
  const [isFlashListReady, setFlashListReady] = React.useState(false);
  const [isListVisible, setIsListVisible] = useState(!messageId);

  const conversation = useAppSelector(state => selectConversationById(state, conversationId));
  const isAllMessagesFetched = useAppSelector(selectIsAllMessagesFetched);
  const isLoadingMessages = useAppSelector(selectIsLoadingMessages);
  const messages = useAppSelector(state => getMessagesByConversationId(state, { conversationId }));
  const attachments = useAppSelector(selectAttachments);

  const { setAddMenuOptionSheetState } = useChatWindowContext();
  const { messageListRef } = useRefsContext();

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

  const firstMessageId = useCallback(() => {
    if (messages && messages.length) {
      const firstMessage = messages[0];
      return firstMessage.id;
    }
    return null;
  }, [messages]);

  const loadMessages = useCallback(
    async ({
      loadingMessagesForFirstTime = false,
      loadOlder = true,
      targetMessageId,
    }: {
      loadingMessagesForFirstTime?: boolean;
      loadOlder?: boolean;
      targetMessageId?: number;
    }) => {
      if (targetMessageId !== undefined) {
        // Load target message and messages around it (for search navigation)
        dispatch(
          conversationActions.fetchPreviousMessages({
            conversationId,
            afterId: targetMessageId - 100,
            beforeId: targetMessageId + 100,
          }),
        );
      } else if (loadingMessagesForFirstTime) {
        dispatch(
          conversationActions.fetchPreviousMessages({
            conversationId,
            beforeId: null,
          }),
        );
      } else if (loadOlder) {
        // Load older messages (before the oldest message we have)
        const beforeId = lastMessageId();
        if (beforeId) {
          dispatch(
            conversationActions.fetchPreviousMessages({
              conversationId,
              beforeId,
            }),
          );
        }
      } else {
        // Load newer messages (after the newest message we have)
        // Note: This is not currently triggered as Flashlist v1 doesnot support onStartReached
        const afterId = firstMessageId();
        if (afterId) {
          dispatch(
            conversationActions.fetchPreviousMessages({
              conversationId,
              afterId: afterId + 1, // +1 to exclude the message we already have
            }),
          );
        }
      }
    },
    [conversationId, dispatch, lastMessageId, firstMessageId],
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
    if (messageId) {
      setIsListVisible(false);
      setFlashListReady(false);
    } else {
      setIsListVisible(true);
    }
  }, [messageId]);

  useEffect(() => {
    if (messageId) {
      loadMessages({ targetMessageId: messageId });
    } else {
      loadMessages({ loadingMessagesForFirstTime: true });
    }
    dispatch(conversationParticipantActions.index({ conversationId }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, messageId]);

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

  // Compute target message index for initialScrollIndex (so FlashList starts
  // rendering from the target position, making items near it measured early)
  const targetMessageIndex = messageId
    ? messagesWithGrouping.findIndex(
        item => !('date' in item) && 'id' in item && item.id === messageId,
      )
    : undefined;

  useScrollToMessage({
    messageId,
    messages: messagesWithGrouping,
    messageListRef,
    isFlashListReady,
    isLoadingMessages,
    onPositioned: () => setIsListVisible(true),
  });

  // Show loader when navigating to a message from search until messages are loaded
  // (prevents list from rendering at wrong position)
  if (messageId && messagesWithGrouping.length === 0 && isLoadingMessages) {
    return (
      <View style={tailwind.style('flex-1 bg-white justify-center items-center')}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <PlatformSpecificKeyboardWrapperComponent
      style={tailwind.style('flex-1 bg-white')}
      interpolator="linear">
      <View style={[tailwind.style('flex-1'), !isListVisible && messageId ? { opacity: 0 } : {}]}>
        <MessagesList
          // Key forces remount when messageId changes, ensuring correct scroll position
          key={messageId ? `search-${messageId}` : 'normal-chat'}
          messages={messagesWithGrouping}
          isFlashListReady={isFlashListReady}
          setFlashListReady={setFlashListReady}
          onEndReached={onEndReached}
          isEmailInbox={isEmailInbox}
          currentUserId={userId as number}
          targetMessageId={messageId}
          initialScrollIndex={
            targetMessageIndex !== undefined && targetMessageIndex >= 0
              ? targetMessageIndex
              : undefined
          }
          isListPositioned={isListVisible}
        />
      </View>
      {!isListVisible && messageId && (
        <View
          pointerEvents="none"
          style={tailwind.style('flex-1 bg-white justify-center items-center absolute inset-0')}>
          <ActivityIndicator />
        </View>
      )}
    </PlatformSpecificKeyboardWrapperComponent>
  );
};
