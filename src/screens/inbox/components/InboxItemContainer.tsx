/* eslint-disable react/display-name */
import React from 'react';
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
import { tailwind } from '@/theme';
import { Icon, Swipeable } from '@/components-next';
import { selectInboxById } from '@/store/inbox/inboxSelectors';
import i18n from '@/i18n';
import { showToast } from '@/helpers/ToastHelper';

type InboxItemContainerProps = {
  item: Notification;
  index: number;
  openedRowIndex: SharedValue<number | null>;
};

const UnreadComponent = React.memo(() => {
  return (
    <Animated.View style={tailwind.style('flex justify-center items-center')}>
      <Icon icon={<MarkAsRead />} size={24} />
    </Animated.View>
  );
});

const ReadComponent = React.memo(() => {
  return (
    <Animated.View style={tailwind.style('flex justify-center items-center')}>
      <Icon icon={<MarkAsUnRead />} size={24} />
    </Animated.View>
  );
});

const DeleteComponent = React.memo(() => {
  return (
    <Animated.View style={tailwind.style('flex justify-center items-center')}>
      <Icon icon={<DeleteIcon />} size={24} />
      <Animated.Text style={tailwind.style('text-sm font-inter-420-20 pt-[3px] text-white')}>
        {i18n.t('NOTIFICATION.DELETE')}
      </Animated.Text>
    </Animated.View>
  );
});

export const InboxItemContainer = (props: InboxItemContainerProps) => {
  const { index, item, openedRowIndex } = props;
  const dispatch = useAppDispatch();

  const meta = item.primaryActor?.meta;
  const inboxId = item.primaryActor?.inboxId;
  const isRead = !!item.readAt;

  const onPressAction = () => {
    markNotificationAsRead();
  };

  const markNotificationAsRead = async () => {
    const payload: MarkAsReadPayload = {
      primaryActorId: item.primaryActorId,
      primaryActorType: item.primaryActorType,
    };
    await dispatch(notificationActions.markAsRead(payload));
    showToast({
      message: i18n.t('NOTIFICATION.ALERTS.MARK_AS_READ'),
    });
  };

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

  const lastActivityAt = () => {
    const time = formatRelativeTime(item.lastActivityAt);
    return formatTimeToShortForm(time, true);
  };

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
    </Swipeable>
  );
};
