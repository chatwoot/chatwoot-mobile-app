import React, { useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import { KeyboardGestureArea } from 'react-native-keyboard-controller';
import Animated, {
  interpolate,
  LinearTransition,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { FlashList } from '@shopify/flash-list';

import { flatMap } from 'lodash';
import useDeepCompareEffect from 'use-deep-compare-effect';

import { useChatWindowContext, useRefsContext } from '@/context';
// import camelcaseKeys from 'camelcase-keys';
// import { messagesListMockdata } from '@/mockdata/messagesListMockdata';
import { tailwind } from '@/theme';
import { Message } from '@/types';
import { useAppKeyboardAnimation } from '@/utils';
import { useAppSelector, useAppDispatch } from '@/hooks';
import {
  getMessagesByConversationId,
  selectConversationById,
} from '@/store/conversation/conversationSelectors';
import { getGroupedMessages } from '@/utils';

import { MessageItem } from './components/MessageItem';
import { conversationActions } from '@/store/conversation/conversationActions';
import {
  selectIsAllMessagesFetched,
  selectIsLoadingMessages,
} from '@/store/conversation/conversationSelectors';
import { selectAttachments } from '@/store/conversation/sendMessageSlice';

const AnimatedFlashlist = Animated.createAnimatedComponent(FlashList);

export const TEXT_MAX_WIDTH = 300;

export type FlashListRenderProps = {
  item: { date: string } | Message;
  index: number;
};

// const MESSAGES_LIST_MOCKDATA = [...messagesListMockdata.payload].reverse();

// const messages = MESSAGES_LIST_MOCKDATA.map(
//   value => camelcaseKeys(value, { deep: true }) as unknown as Message,
// );

const PlatformSpecificKeyboardWrapperComponent =
  Platform.OS === 'android' ? Animated.View : KeyboardGestureArea;

export const MessagesList = () => {
  const { conversationId } = useChatWindowContext();
  const { messageListRef } = useRefsContext();
  const [isFlashListReady, setFlashListReady] = React.useState(false);
  const dispatch = useAppDispatch();
  const conversation = useAppSelector(state => selectConversationById(state, conversationId));
  const isAllMessagesFetched = useAppSelector(selectIsAllMessagesFetched);
  const isLoadingMessages = useAppSelector(selectIsLoadingMessages);

  const messages = useAppSelector(state => getMessagesByConversationId(state, { conversationId }));

  const handleRender = useCallback(({ item, index }: FlashListRenderProps) => {
    return <MessageItem {...{ item, index }} />;
  }, []);

  const attachments = useAppSelector(selectAttachments);
  const { progress, height } = useAppKeyboardAnimation();
  const { setAddMenuOptionSheetState } = useChatWindowContext();

  useDeepCompareEffect(() => {
    setAddMenuOptionSheetState(false);
  }, [attachments]);

  // const allMessages = flatMap(chatMessages, section => [...section.data, { date: section.date }]);

  const animatedFlashlistStyle = useAnimatedStyle(() => {
    return {
      marginBottom: withSpring(interpolate(progress.value, [0, 1], [0, height.value]), {
        stiffness: 240,
        damping: 38,
      }),
    };
  });

  const onEndReached = () => {
    const shouldFetchMoreMessages = !isAllMessagesFetched && !isLoadingMessages && isFlashListReady;

    if (shouldFetchMoreMessages) {
      loadMessages({ loadingMessagesForFirstTime: false });
    }
  };

  const lastMessageId = useCallback(() => {
    let beforeId = null;
    if (messages && messages.length) {
      const lastMessage = messages[messages.length - 1];
      const { id } = lastMessage;
      beforeId = id;
    }
    return beforeId;
  }, [messages]);

  useEffect(() => {
    loadMessages({ loadingMessagesForFirstTime: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMessages = useCallback(
    async ({ loadingMessagesForFirstTime = false }) => {
      const beforeId = loadingMessagesForFirstTime ? null : lastMessageId();
      // Fetch conversation if not present and fetch previous messages, otherwise fetch previous messages
      if (!conversation) {
        await dispatch(conversationActions.fetchConversation(conversationId));
        dispatch(
          conversationActions.fetchPreviousMessages({
            conversationId,
            beforeId,
          }),
        );
      } else {
        dispatch(
          conversationActions.fetchPreviousMessages({
            conversationId,
            beforeId,
          }),
        );
      }
    },
    [conversation, conversationId, dispatch, lastMessageId],
  );

  const groupedMessages = getGroupedMessages(messages);

  const allMessages = flatMap(groupedMessages, section => [
    ...section.data,
    { date: section.date },
  ]);

  return (
    <PlatformSpecificKeyboardWrapperComponent
      style={tailwind.style('flex-1 bg-white')}
      interpolator="linear">
      <Animated.View
        layout={LinearTransition.springify().damping(38).stiffness(240)}
        // * Setting a min height to the flashlist fixes the warning
        style={[tailwind.style('flex-1 min-h-10'), animatedFlashlistStyle]}>
        <AnimatedFlashlist
          layout={LinearTransition.springify().damping(38).stiffness(240)}
          onScroll={() => {
            if (!isFlashListReady) {
              setFlashListReady(true);
            }
          }}
          ref={messageListRef}
          inverted
          estimatedItemSize={100}
          showsVerticalScrollIndicator={false}
          // @ts-ignore
          renderItem={handleRender}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.1}
          data={allMessages}
          keyboardShouldPersistTaps="handled"
          // * Add an empty state component - when there are no messages
          // ListEmptyComponent={}
          // @ts-ignore
          keyExtractor={(item: { date: string } | Message) => {
            if ('date' in item) {
              return item.date.toString();
            } else if ('content' in item) {
              return item.id.toString();
            }
          }}
        />
      </Animated.View>
    </PlatformSpecificKeyboardWrapperComponent>
  );
};
