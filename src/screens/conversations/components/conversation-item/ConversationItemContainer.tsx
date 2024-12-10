/* eslint-disable react/display-name */
import React, { memo, useCallback, useMemo } from 'react';
import { StackActions, useNavigation } from '@react-navigation/native';
import Animated, { SharedValue } from 'react-native-reanimated';

import { useRefsContext } from '@/context';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { Conversation } from '@/types';
import {
  toggleSelection,
  selectSelected,
  selectSingleConversation,
  clearSelection,
} from '@/store/conversation/conversationSelectedSlice';
import { selectCurrentState, setCurrentState } from '@/store/conversation/conversationHeaderSlice';
import { setActionState } from '@/store/conversation/conversationActionSlice';
import { selectInboxById } from '@/store/inbox/inboxSelectors';
import { selectContactById } from '@/store/contact/contactSelectors';
import { selectTypingUsersByConversationId } from '@/store/conversation/conversationTypingSlice';
import { conversationActions } from '@/store/conversation/conversationActions';
import { selectAllLabels } from '@/store/label/labelSelectors';

import { isContactTyping, getLastMessage } from '@/utils';
import { Icon, Swipeable } from '@/components-next/common';

import { ConversationItem } from './ConversationItem';
import { MarkAsUnRead, StatusIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import { MarkAsRead } from '@/svg-icons';
import i18n from '@/i18n';

type ConversationItemContainerProps = {
  conversationItem: Conversation;
  index: number;
  openedRowIndex: SharedValue<number | null>;
};

const ReadComponent = React.memo(() => {
  return (
    <Animated.View style={tailwind.style('flex justify-center items-center')}>
      <Icon icon={<MarkAsRead />} size={24} />
    </Animated.View>
  );
});

const UnreadComponent = React.memo(() => {
  return (
    <Animated.View style={tailwind.style('flex justify-center items-center')}>
      <Icon icon={<MarkAsUnRead />} size={24} />
    </Animated.View>
  );
});

const StatusComponent = React.memo(() => {
  return (
    <Animated.View style={tailwind.style('flex justify-center items-center ')}>
      <Icon icon={<StatusIcon />} size={24} />
      <Animated.Text style={tailwind.style('text-sm font-inter-420-20 pt-[3px] text-white')}>
        {i18n.t('CONVERSATION.ITEM.STATUS')}
      </Animated.Text>
    </Animated.View>
  );
});

export const ConversationItemContainer = memo((props: ConversationItemContainerProps) => {
  const { conversationItem, index, openedRowIndex } = props;
  const {
    meta: {
      sender: { name: senderName, thumbnail: senderThumbnail, id: contactId },
      assignee,
    },
    id,
    priority,
    unreadCount,
    labels,
    timestamp,
    inboxId,
    lastNonActivityMessage,
    slaPolicyId,
    appliedSla,
    firstReplyCreatedAt,
    waitingSince,
    status,
    additionalAttributes,
  } = conversationItem;

  // Hooks
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { actionsModalSheetRef } = useRefsContext();

  // Selectors
  const allLabels = useAppSelector(selectAllLabels);
  const contact = useAppSelector(state => selectContactById(state, contactId));
  const inbox = useAppSelector(state => selectInboxById(state, inboxId));
  const typingUsers = useAppSelector(selectTypingUsersByConversationId(id));
  const selected = useAppSelector(selectSelected);
  const currentState = useAppSelector(selectCurrentState);

  // Derived state
  const { availabilityStatus } = contact || {};
  const isSelected = useMemo(() => id in selected, [selected, id]);
  const isTyping = useMemo(() => isContactTyping(typingUsers, contactId), [typingUsers, contactId]);
  const lastMessage = getLastMessage(conversationItem);

  const markMessageReadOrUnread = useCallback(() => {
    if (unreadCount > 0) {
      dispatch(conversationActions.markMessageRead({ conversationId: id }));
    } else {
      dispatch(conversationActions.markMessagesUnread({ conversationId: id }));
    }
  }, [dispatch, id, unreadCount]);

  const onStatusAction = useCallback(() => {
    dispatch(selectSingleConversation(conversationItem));
    dispatch(setActionState('Status'));
    actionsModalSheetRef.current?.present();
  }, [dispatch, conversationItem, actionsModalSheetRef]);

  const onLongPressAction = useCallback(() => {
    dispatch(clearSelection());
    dispatch(setCurrentState('Select'));
  }, [dispatch]);

  const onPressAction = useCallback(() => {
    if (currentState === 'Select') {
      dispatch(toggleSelection({ conversation: conversationItem }));
    } else {
      const pushToChatScreen = StackActions.push('ChatScreen', {
        conversationId: id,
        isConversationOpenedExternally: false,
      });
      navigation.dispatch(pushToChatScreen);
    }
  }, [currentState, dispatch, conversationItem, navigation, id]);

  const viewProps = {
    id,
    senderName,
    senderThumbnail,
    isSelected,
    currentState,
    unreadCount,
    isTyping,
    availabilityStatus: availabilityStatus || 'offline',
    priority,
    labels,
    timestamp,
    inbox: inbox || null,
    lastNonActivityMessage,
    lastMessage,
    inboxId,
    assignee: assignee || null,
    slaPolicyId,
    appliedSla: appliedSla || null,
    appliedSlaConversationDetails: {
      firstReplyCreatedAt,
      waitingSince,
      status,
    },
    additionalAttributes,
    allLabels,
  };

  return (
    <Swipeable
      spacing={27}
      leftElement={unreadCount > 0 ? <ReadComponent /> : <UnreadComponent />}
      rightElement={<StatusComponent />}
      handleLeftElementPress={markMessageReadOrUnread}
      handleOnLeftOverswiped={markMessageReadOrUnread}
      handleRightElementPress={onStatusAction}
      handleOnRightOverswiped={onStatusAction}
      handleLongPress={onLongPressAction}
      handlePress={onPressAction}
      triggerOverswipeOnFlick
      {...{ index, openedRowIndex }}>
      <ConversationItem {...viewProps} />
    </Swipeable>
  );
});
