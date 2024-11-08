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
import camelcaseKeys from 'camelcase-keys';
import { flatMap } from 'lodash';
import useDeepCompareEffect from 'use-deep-compare-effect';

import { useChatWindowContext, useRefsContext } from '../../context';
import { messagesListMockdata } from '../../mockdata/messagesListMockdata';
import { useMessageList, useSendMessage } from '../../storev2';
import { tailwind } from '../../theme';
import { Message } from '../../types';
import { useAppKeyboardAnimation } from '../../utils';

import { MessageCell } from './MessageCell';

const AnimatedFlashlist = Animated.createAnimatedComponent(FlashList);

export const TEXT_MAX_WIDTH = 300;

export type FlashListRenderProps = {
  item: { date: string } | Message;
  index: number;
};

const PlatformSpecificKeyboardWrapperComponent =
  Platform.OS === 'android' ? Animated.View : KeyboardGestureArea;

const MESSAGES_LIST_MOCKDATA = [...messagesListMockdata.payload].reverse();

export const MessagesList = () => {
  const { messageListRef } = useRefsContext();

  const handleRender = useCallback(({ item, index }: FlashListRenderProps) => {
    return <MessageCell {...{ item, index }} />;
  }, []);

  const setMessageListStore = useMessageList(state => state.setMessageList);
  const attachments = useSendMessage(state => state.attachments);
  const chatMessages = useMessageList(state => state.messageList);

  useEffect(() => {
    const messageList = MESSAGES_LIST_MOCKDATA.map(
      value => camelcaseKeys(value, { deep: true }) as unknown as Message,
    );

    setMessageListStore(messageList);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { progress, height } = useAppKeyboardAnimation();
  const { setAddMenuOptionSheetState } = useChatWindowContext();

  useDeepCompareEffect(() => {
    setAddMenuOptionSheetState(false);
  }, [attachments]);

  const allMessages = flatMap(chatMessages, section => [...section.data, { date: section.date }]);

  const animatedFlashlistStyle = useAnimatedStyle(() => {
    return {
      marginBottom: withSpring(interpolate(progress.value, [0, 1], [0, height.value]), {
        stiffness: 240,
        damping: 38,
      }),
    };
  });

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
          ref={messageListRef}
          inverted
          estimatedItemSize={30}
          showsVerticalScrollIndicator={false}
          // @ts-ignore
          renderItem={handleRender}
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
