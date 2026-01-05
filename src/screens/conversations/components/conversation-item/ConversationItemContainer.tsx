/* eslint-disable react/display-name */
import { StackActions, useNavigation } from '@react-navigation/native';
import React, { memo, useCallback, useMemo } from 'react';
import Animated, { SharedValue } from 'react-native-reanimated';

import { useRefsContext } from '@/context';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { selectContactById } from '@/store/contact/contactSelectors';
import { conversationActions } from '@/store/conversation/conversationActions';
import { setActionState } from '@/store/conversation/conversationActionSlice';
import { selectCurrentState, setCurrentState } from '@/store/conversation/conversationHeaderSlice';
import {
  clearSelection,
  selectSelected,
  selectSingleConversation,
  toggleSelection,
} from '@/store/conversation/conversationSelectedSlice';
import { selectTypingUsersByConversationId } from '@/store/conversation/conversationTypingSlice';
import { selectInboxById } from '@/store/inbox/inboxSelectors';
import {
  selectKanbanFunnels,
  selectKanbanItemsListByConversationId,
} from '@/store/kanban/kanbanSelectors';
import { selectAllLabels } from '@/store/label/labelSelectors';
import { Conversation } from '@/types';

import { Icon, Swipeable } from '@/components-next/common';
import { getLastMessage, getTypingUsersText, isContactTyping } from '@/utils';

import i18n from '@/i18n';
import { MarkAsRead, MarkAsUnRead, StatusIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import { ConversationItem } from './ConversationItem';

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
  const kanbanItems = useAppSelector(state => selectKanbanItemsListByConversationId(state, id));
  const funnels = useAppSelector(selectKanbanFunnels);
  const typingUsers = useAppSelector(selectTypingUsersByConversationId(id));
  const selected = useAppSelector(selectSelected);
  const currentState = useAppSelector(selectCurrentState);

  const { availabilityStatus, name: contactName, thumbnail: contactThumbnail } = contact || {};
  const isSelected = useMemo(() => id in selected, [selected, id]);
  const isTyping = useMemo(() => isContactTyping(typingUsers, contactId), [typingUsers, contactId]);
  const typingText = useMemo(() => getTypingUsersText({ users: typingUsers }), [typingUsers]);

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
  }, [dispatch, conversationItem]);

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

  const kanbanInfo = useMemo(() => {
    if (!kanbanItems || kanbanItems.length === 0 || !funnels) return null;

    const items = kanbanItems
      .map(item => {
        const funnel = funnels.find(f => f.id === item.funnel_id);
        if (!funnel) return null;

        let stageName = item.stage_key || item.funnel_stage;
        let stageColor = '#1F2937'; // gray-800 default

        if (funnel.stages) {
          const stages = Array.isArray(funnel.stages)
            ? funnel.stages
            : Object.values(funnel.stages);
          const stage = stages.find(
            (s: any) => s.id === item.stage_id || s.stage_key === item.stage_key,
          );
          if (stage) {
            stageName = stage.name;
            if (stage.color) stageColor = stage.color;
          }
        }

        return {
          funnelName: funnel.name,
          stageName: stageName || '',
          color: stageColor,
        };
      })
      .filter(Boolean) as { funnelName: string; stageName: string; color: string }[];

    if (items.length === 0) return null;

    return {
      items,
      hasMore: items.length > 1,
    };
  }, [kanbanItems, funnels]);

  const viewProps = {
    id,
    senderName: contactName || senderName,
    senderThumbnail: contactThumbnail || senderThumbnail,
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
    typingText: typingText as string | undefined,
    kanbanInfo,
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
