import React, { useCallback, useEffect, useRef, useState } from 'react';
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
  selectIsAllNewerMessagesFetched,
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
  const { conversationId, messageId, scrollToMessageId, setScrollToMessageId } =
    useChatWindowContext();
  const dispatch = useAppDispatch();
  const [isFlashListReady, setFlashListReady] = React.useState(false);
  // True while a search jump is loading both sides of the target, so the list is
  // mounted once with stable data (avoids the target index shifting mid-load).
  const [isSearchLoading, setIsSearchLoading] = useState(!!messageId);
  // Search-jump fetches, aborted when navigating to another target or conversation
  // so a stale resetMessages response can't replace the current target's window.
  const inFlightSearchFetchesRef = useRef<{ abort: () => void }[]>([]);

  const conversation = useAppSelector(state => selectConversationById(state, conversationId));
  const isAllMessagesFetched = useAppSelector(selectIsAllMessagesFetched);
  const isAllNewerMessagesFetched = useAppSelector(selectIsAllNewerMessagesFetched);
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
        // Search navigation: load a count-based window around the target (ID
        // spans are unreliable because message ids are global across all
        // conversations). First the target + older messages (resets the list),
        // then a page of newer messages so the target has context on both sides.
        const resetRequest = dispatch(
          conversationActions.fetchPreviousMessages({
            conversationId,
            beforeId: targetMessageId + 1,
            resetMessages: true,
          }),
        );
        inFlightSearchFetchesRef.current.push(resetRequest);
        const resetResult = await resetRequest;
        // Aborted because a newer target or conversation took over; skip the
        // follow-up fetch so stale data can't land on the current window.
        if (
          conversationActions.fetchPreviousMessages.rejected.match(resetResult) &&
          resetResult.meta.aborted
        ) {
          return;
        }
        const newerRequest = dispatch(
          conversationActions.fetchPreviousMessages({
            conversationId,
            afterId: targetMessageId,
          }),
        );
        inFlightSearchFetchesRef.current.push(newerRequest);
        await newerRequest;
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
        // Load newer messages (after the newest we have). Any overlap is
        // de-duplicated in the slice, so pass the id directly to avoid skipping one.
        const afterId = firstMessageId();
        if (afterId) {
          dispatch(
            conversationActions.fetchPreviousMessages({
              conversationId,
              afterId,
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
        // Only refresh to the latest page when already at the newest edge. While a
        // search window (older messages) is showing, refreshing would prepend the
        // latest page with a gap and disable newer pagination.
        if (routeName && SCREENS.CHAT === routeName && isAllNewerMessagesFetched) {
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
  }, [appState, conversationId, dispatch, isAllNewerMessagesFetched]);

  // Inverted list: older history is at the end of the data, fetched when the
  // user scrolls to the bottom (visually the top).
  const onEndReached = () => {
    const shouldFetchMoreMessages = !isAllMessagesFetched && !isLoadingMessages && isFlashListReady;
    if (shouldFetchMoreMessages) {
      loadMessages({ loadingMessagesForFirstTime: false });
    }
  };

  // After a search jump the loaded window can sit before the latest messages;
  // page newer ones in when the user scrolls to the newest edge (visually the
  // bottom). No-op on a normal chat, which is already at the latest.
  const onStartReached = () => {
    const shouldFetchNewerMessages =
      !isAllNewerMessagesFetched && !isLoadingMessages && isFlashListReady;
    if (shouldFetchNewerMessages) {
      loadMessages({ loadOlder: false });
    }
  };

  // A new search target re-mounts the list; wait for its layout before positioning.
  useEffect(() => {
    if (messageId) {
      setFlashListReady(false);
    }
  }, [messageId]);

  useEffect(() => {
    let active = true;
    if (messageId) {
      setIsSearchLoading(true);
      loadMessages({ targetMessageId: messageId }).finally(() => {
        if (active) setIsSearchLoading(false);
      });
    } else {
      loadMessages({ loadingMessagesForFirstTime: true });
    }
    dispatch(conversationParticipantActions.index({ conversationId }));
    return () => {
      active = false;
      inFlightSearchFetchesRef.current.forEach(request => request.abort());
      inFlightSearchFetchesRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, messageId]);

  const groupedMessages = getGroupedMessages(messages);

  // The list is rendered inverted, so data stays newest-first and each day's
  // date separator follows that day's messages (it renders above them).
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

  const clearScrollToMessageId = useCallback(
    () => setScrollToMessageId(undefined),
    [setScrollToMessageId],
  );

  const { highlightedMessageId, isListVisible } = useScrollToMessage({
    messageId,
    scrollToMessageId,
    clearScrollToMessageId,
    messages: messagesWithGrouping,
    messageListRef,
    isFlashListReady,
    isLoadingMessages,
  });

  // For search navigation, keep the loader up while both sides of the target load
  // so the list mounts once with stable data. Gated on isSearchLoading only: once
  // loading settles the list renders even with no messages, so an empty or deleted
  // target lands on a recoverable empty state instead of a permanent spinner.
  if (messageId && isSearchLoading) {
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
          onStartReached={onStartReached}
          isEmailInbox={isEmailInbox}
          currentUserId={userId as number}
          isSearchNavigation={messageId !== undefined}
          highlightedMessageId={highlightedMessageId}
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
