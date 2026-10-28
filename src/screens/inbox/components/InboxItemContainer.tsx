import { useTailwind } from '@/theme/useTailwind';
/* eslint-disable react/display-name */
import React, { useCallback } from 'react';
import { SharedValue } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';

import { notificationActions } from '@/store/notification/notificationAction';
import { useAppDispatch, useAppSelector } from '@/hooks';
import type { Notification } from '@/types/Notification';
import type { MarkAsReadPayload } from '@/store/notification/notificationTypes';
import { MarkAsRead, MarkAsUnRead, DeleteIcon } from '@/svg-icons';
import { InboxItem } from './InboxItem';
import { formatRelativeTime } from '@/utils/dateTimeUtils';
import { formatTimeToShortForm } from '@/utils/dateTimeUtils';
import { Icon, Swipeable } from '@/components-next';
import { selectInboxById } from '@/store/inbox/inboxSelectors';
import i18n from '@/i18n';
import { showToast } from '@/utils/toastUtils';
import { StackActions, useNavigation } from '@react-navigation/native';
import { useSplitView } from '@/navigation/split/SplitViewContext';
import { SelectedRowBackground } from '@/navigation/split/SelectedRowBackground';
import { conversationActions } from '@/store/conversation/conversationActions';

type InboxItemContainerProps = {
  item: Notification;
  index: number;
  openedRowIndex: SharedValue<number | null>;
  // The next row's conversation, so this row can hide its divider above a selected row.
  nextConversationId?: number;
};

const UnreadComponent = React.memo(() => {
  const tailwind = useTailwind();
  return (
    <Animated.View style={tailwind.style('flex justify-center items-center')}>
      <Icon icon={<MarkAsRead />} size={24} />
    </Animated.View>
  );
});

const ReadComponent = React.memo(() => {
  const tailwind = useTailwind();
  return (
    <Animated.View style={tailwind.style('flex justify-center items-center')}>
      <Icon icon={<MarkAsUnRead />} size={24} />
    </Animated.View>
  );
});

const DeleteComponent = React.memo(() => {
  const tailwind = useTailwind();
  return (
    <Animated.View style={tailwind.style('flex justify-center items-center')}>
      <Icon icon={<DeleteIcon />} size={24} />
      <Animated.Text style={tailwind.style('text-sm font-inter-420-20 pt-[3px] text-white')}>
        {i18n.t('NOTIFICATION.DELETE')}
      </Animated.Text>
    </Animated.View>
  );
});

export const InboxItemContainerComponent = (props: InboxItemContainerProps) => {
  const { index, item, openedRowIndex, nextConversationId } = props;
  const dispatch = useAppDispatch();

  const navigation = useNavigation();
  const splitView = useSplitView();
  const meta = item.primaryActor?.meta;
  const inboxId = item.primaryActor?.inboxId;
  const isRead = !!item.readAt;

  const onPressAction = async () => {
    markNotificationAsRead({
      shouldShowToast: false,
    });
    if (item.primaryActor?.id) {
      // Already open in the split view's pane: refetching would replace its messages and
      // reset the chat, so leave it as is.
      if (splitView?.selectedConversationId === item.primaryActor.id) return;
      await dispatch(conversationActions.fetchConversation(item.primaryActor?.id));
      if (splitView) {
        splitView.openConversation(item.primaryActor.id);
        return;
      }
      const pushToChatScreen = StackActions.push('ChatScreen', {
        conversationId: item.primaryActor?.id,
        isConversationOpenedExternally: false,
      });
      navigation.dispatch(pushToChatScreen);
    }
  };

  const markNotificationAsRead = useCallback(
    async ({ shouldShowToast = true } = {}) => {
      const payload: MarkAsReadPayload = {
        primaryActorId: item.primaryActorId,
        primaryActorType: item.primaryActorType,
      };
      await dispatch(notificationActions.markAsRead(payload));
      if (shouldShowToast) {
        showToast({ message: i18n.t('NOTIFICATION.ALERTS.MARK_AS_READ') });
      }
    },
    [dispatch, item.primaryActorId, item.primaryActorType],
  );

  const markNotificationAsUnread = async () => {
    await dispatch(notificationActions.markAsUnread(item.id));
    showToast({
      message: i18n.t('NOTIFICATION.ALERTS.MARK_AS_UNREAD'),
    });
  };

  const onSwipeRightAction = async () => {
    await dispatch(notificationActions.delete(item.id));
    showToast({
      message: i18n.t('NOTIFICATION.ALERTS.DELETE'),
    });
  };

  const onSwipeLeftAction = () => {
    if (isRead) {
      markNotificationAsUnread();
    } else {
      markNotificationAsRead();
    }
  };

  const lastActivityAt = useCallback(() => {
    const time = formatRelativeTime(item.lastActivityAt);
    return formatTimeToShortForm(time, true);
  }, [item.lastActivityAt]);

  const inbox = useAppSelector(state => selectInboxById(state, inboxId));

  const additionalAttributes = item.primaryActor?.additionalAttributes;
  const sender = meta?.sender;
  const assignee = meta?.assignee;
  const conversationId = item.primaryActor?.id;
  const priority = item.primaryActor?.priority;
  const notificationType = item.notificationType;
  const pushTitle = i18n.t(`NOTIFICATION.TYPES.${notificationType.toUpperCase()}`);

  return (
    <Swipeable
      spacing={27}
      leftElement={isRead ? <ReadComponent /> : <UnreadComponent />}
      rightElement={<DeleteComponent />}
      handleLeftElementPress={onSwipeLeftAction}
      handleOnLeftOverswiped={onSwipeLeftAction}
      handleRightElementPress={onSwipeRightAction}
      handleOnRightOverswiped={onSwipeRightAction}
      handlePress={onPressAction}
      triggerOverswipeOnFlick
      rightElementBgColor="bg-ruby-800"
      {...{ index, openedRowIndex }}>
      <SelectedRowBackground
        selected={
          !!item.primaryActor?.id && splitView?.selectedConversationId === item.primaryActor.id
        }
        beforeSelected={
          !!nextConversationId && splitView?.selectedConversationId === nextConversationId
        }>
        <InboxItem
          isRead={isRead}
          assignee={assignee}
          lastActivityAt={lastActivityAt}
          sender={sender}
          conversationId={conversationId}
          priority={priority}
          inbox={inbox || null}
          additionalAttributes={additionalAttributes}
          pushMessageTitle={pushTitle}
          notificationType={notificationType}
        />
      </SelectedRowBackground>
    </Swipeable>
  );
};

InboxItemContainerComponent.displayName = 'InboxItemContainer';
export const InboxItemContainer = React.memo(InboxItemContainerComponent);
