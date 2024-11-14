/* eslint-disable react/display-name */
import React, { memo, useCallback, useMemo } from 'react';
import { Alert, ImageURISource } from 'react-native';
import Animated, { SharedValue } from 'react-native-reanimated';
import { StackActions, useNavigation } from '@react-navigation/native';

import { Icon, Swipeable } from '@/components-next/common';
import { NativeView } from '@/components-next/native-components';
import { useRefsContext } from '@/context';
import { AssignIcon, StatusIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import { Conversation } from '@/types';
import i18n from '@/i18n';

import { ConversationAvatar } from './ConversationAvatar';
import { ConversationItemDetail } from './ConversationItemDetail';
import { ConversationSelect } from './ConversationSelect';

import {
  toggleSelection,
  selectSelectedIndexes,
} from '@/store/conversation/conversationSelectedSlice';
import { selectCurrentState, setCurrentState } from '@/store/conversation/conversationHeaderSlice';
import { setActionState } from '@/store/conversation/conversationActionSlice';
import { useAppDispatch, useAppSelector } from '@/hooks';
// import { selectContactById } from '@/store/contact/contactSelectors';
import { selectInboxById } from '@/store/inbox/inboxSelectors';
import { getLastMessage } from '@/utils/conversationUtils';
import { Inbox } from '@/types/Inbox';

type ConversationCellProps = {
  conversationItem: Conversation;
  index: number;
  openedRowIndex: SharedValue<number | null>;
};

const AssignComponent = React.memo(() => {
  return (
    <Animated.View style={tailwind.style('flex justify-center items-center')}>
      <Icon icon={<AssignIcon />} size={24} />
      <Animated.Text style={tailwind.style('text-sm font-inter-420-20 pt-[3px] text-white')}>
        {i18n.t('CONVERSATION.ITEM.ASSIGN')}
      </Animated.Text>
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

export const ConversationItem = memo((props: ConversationCellProps) => {
  const {
    meta: {
      sender: { name: senderName, thumbnail: senderThumbnail },
      assignee,
    },
    id,
    priority,
    messages,
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
  } = props.conversationItem;

  // const contact = useAppSelector(state => selectContactById(state, contactId));

  const inbox = {
    channelType: 'Channel::WebWidget',
  };

  // const typingUsers = useAppSelector(selectTypingUsersByConversationId(id));

  // TODO: show the availability status in the avatar
  // const { availabilityStatus } = contact || {};

  const { openedRowIndex, index } = props;

  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const selectedIndexes = useAppSelector(selectSelectedIndexes);

  const currentState = useAppSelector(selectCurrentState);
  const { actionsModalSheetRef } = useRefsContext();

  const onAssignAction = useCallback(() => {
    dispatch(setActionState('Assign'));
    actionsModalSheetRef.current?.present();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onStatusAction = useCallback(() => {
    dispatch(setActionState('Status'));
    actionsModalSheetRef.current?.present();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isSelected = useMemo(
    () => selectedIndexes.includes(index),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedIndexes],
  );

  const onLongPressAction = () => {
    dispatch(setCurrentState('Select'));
  };

  const pushToChatScreen = StackActions.push('ChatScreen', {
    conversationId: id,
    isConversationOpenedExternally: false,
  });

  const onPressAction = () => {
    if (currentState === 'Select') {
      // When Select is activated
      dispatch(toggleSelection(index));
    } else {
      navigation.dispatch(pushToChatScreen);
    }
  };

  const handleLeftPaneOverswiped = () => {
    Alert.alert('Assigned to you');
  };

  const handleRightPaneOverswiped = () => {
    Alert.alert('Conversation marked as resolved');
  };

  const lastMessage = getLastMessage(props.conversationItem);

  return (
    <Swipeable
      spacing={27}
      leftElement={<AssignComponent />}
      rightElement={<StatusComponent />}
      handleLeftElementPress={onAssignAction}
      handleRightElementPress={onStatusAction}
      handleOnLeftOverswiped={handleLeftPaneOverswiped}
      handleOnRightOverswiped={handleRightPaneOverswiped}
      handleLongPress={onLongPressAction}
      handlePress={onPressAction}
      {...{ index, openedRowIndex }}>
      <NativeView style={tailwind.style('px-3 gap-3 flex-row justify-between')}>
        <NativeView style={tailwind.style('py-3 flex flex-row')}>
          <ConversationSelect {...{ isSelected, currentState }} />
          <ConversationAvatar
            src={{ uri: senderThumbnail } as ImageURISource}
            name={senderName as string}
          />
        </NativeView>

        <ConversationItemDetail
          {...{
            id,
            priority,
            messages,
            unreadCount,
            labels,
            assignee,
            senderName,
            timestamp,
            inbox: inbox as Inbox,
            lastNonActivityMessage,
            slaPolicyId,
            lastMessage,
            inboxId,
            appliedSla,
            appliedSlaConversationDetails: {
              firstReplyCreatedAt,
              waitingSince,
              status,
            },
            additionalAttributes,
          }}
        />
      </NativeView>
    </Swipeable>
  );
});
