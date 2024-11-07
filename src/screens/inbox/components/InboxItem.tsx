/* eslint-disable react/display-name */
import React from 'react';
import Animated from 'react-native-reanimated';

import { Avatar, HashIcon, Icon, Swipeable } from '@/components-next';
import { useInboxListStateContext } from '@/context';
import type { Notification } from '@/types/Notification';
import { MarkAsRead, MarkAsUnRead, SnoozedIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import { formatTimeToShortForm, formatRelativeTime } from '@/utils';
import { notificationActions } from '@/store/notification/notificationAction';
import { useAppDispatch } from '@/hooks';
import type { MarkAsReadPayload } from '@/store/notification/notificationTypes';

type InboxItemProps = {
  item: Notification;
  index: number;
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

export const InboxItem = (props: InboxItemProps) => {
  const { index, item } = props;
  const dispatch = useAppDispatch();
  const { openedRowIndex } = useInboxListStateContext();

  const onPressAction = () => {
    const payload: MarkAsReadPayload = {
      primary_actor_id: item.primary_actor_id,
      primary_actor_type: item.primary_actor_type,
    };
    dispatch(notificationActions.markAsRead(payload));
  };
  //   const { readInboxItems, toggleReadState, showUnread } = useInboxReadUnreadState();
  const onSwipeLeftAction = () => {
    // toggleReadState(item.id);
  };

  //   const isRead = useMemo(
  //     () => readInboxItems.includes(item.id),
  //     // eslint-disable-next-line react-hooks/exhaustive-deps
  //     [readInboxItems.length],
  //   );
  const isRead = item.read_at;

  const meta = item.primary_actor?.meta;
  const assignee = meta?.sender;

  const lastActivityAt = () => {
    const time = formatRelativeTime(item.last_activity_at);
    return formatTimeToShortForm(time, true);
  };

  return (
    <Swipeable
      spacing={36}
      leftElement={isRead ? <ReadComponent /> : <UnreadComponent />}
      handleLeftElementPress={onSwipeLeftAction}
      handleOnLeftOverswiped={onSwipeLeftAction}
      handlePress={onPressAction}
      triggerOverswipeOnFlick
      {...{ index, openedRowIndex }}>
      <Animated.View style={tailwind.style('ml-3 py-3 pr-4 border-b-[1px] border-b-blackA-A3')}>
        <Animated.View style={tailwind.style('')}>
          <Animated.View style={tailwind.style('flex flex-row justify-between')}>
            <Animated.View style={tailwind.style('flex flex-row')}>
              <Animated.Text
                style={tailwind.style(
                  'text-base font-inter-medium-24 leading-[17px] tracking-[0.32px] text-gray-950',
                )}>
                {assignee?.name}
              </Animated.Text>
              <Animated.View style={tailwind.style('flex flex-row items-center pl-1')}>
                <HashIcon />
                <Animated.Text
                  style={tailwind.style(
                    'text-cxs font-inter-420-20 leading-[15px] tracking-[0.32px] text-gray-700',
                  )}>
                  {item.id}
                </Animated.Text>
              </Animated.View>
            </Animated.View>
            <Animated.Text
              style={tailwind.style(
                'text-sm font-inter-420-20 leading-[16px] tracking-[0.32px] text-gray-700',
              )}>
              {lastActivityAt()}
            </Animated.Text>
          </Animated.View>

          <Animated.View style={tailwind.style('flex flex-row justify-between mt-1.5')}>
            <Animated.View style={tailwind.style('flex flex-row items-center')}>
              <Avatar
                src={assignee.thumbnail ? { uri: assignee.thumbnail } : undefined}
                size="md"
                name={assignee.name}
              />

              <Animated.Text
                style={tailwind.style(
                  'pl-1.5 font-inter-420-20 text-md text-gray-900 leading-[17px] tracking-[0.32px]',
                )}>
                {item.push_message_title.slice(0, 40)}
              </Animated.Text>
            </Animated.View>
            <Animated.View
              style={tailwind.style(
                'h-6 w-6 rounded-full justify-center items-center',
                'bg-green-700',
              )}>
              <Icon icon={<SnoozedIcon stroke={tailwind.color('text-white')} />} size={19.2} />
            </Animated.View>
          </Animated.View>
        </Animated.View>
      </Animated.View>
      {/* Possible animate the opacity */}
      {isRead && (
        <Animated.View style={tailwind.style('absolute bg-white opacity-50 inset-0 z-20')} />
      )}
    </Swipeable>
  );
};
