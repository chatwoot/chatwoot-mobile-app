/* eslint-disable react/display-name */
import React from 'react';
import Animated from 'react-native-reanimated';

import { Avatar, HashIcon, Icon, Swipeable } from '@/components-next';
import { useInboxListStateContext } from '@/context';
import type { Notification } from '@/types/Notification';
import { MarkAsRead, MarkAsUnRead } from '@/svg-icons';
import { tailwind } from '@/theme';
import { getDynamicTime, getShortTimeStamp } from '@/utils';

type InboxItemProps = {
  cellData: Notification;
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
  const { index, cellData } = props;
  const { openedRowIndex } = useInboxListStateContext();

  const onPressAction = () => {};
  //   const { readInboxItems, toggleReadState, showUnread } = useInboxReadUnreadState();
  const onSwipeLeftAction = () => {
    // toggleReadState(cellData.id);
  };

  //   const isRead = useMemo(
  //     () => readInboxItems.includes(cellData.id),
  //     // eslint-disable-next-line react-hooks/exhaustive-deps
  //     [readInboxItems.length],
  //   );
  const isRead = true;
  const showUnread = true;

  const meta = cellData.primary_actor?.meta;
  const assignee = meta?.assignee;

  const lastActivityAt = () => {
    const time = getDynamicTime(cellData.last_activity_at);
    return getShortTimeStamp(time, true);
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
                {assignee.name}
              </Animated.Text>
              <Animated.View style={tailwind.style('flex flex-row items-center pl-1')}>
                <HashIcon />
                <Animated.Text
                  style={tailwind.style(
                    'text-cxs font-inter-420-20 leading-[15px] tracking-[0.32px] text-gray-700',
                  )}>
                  {cellData.id}
                </Animated.Text>
              </Animated.View>
            </Animated.View>
            <Animated.Text
              style={tailwind.style(
                'text-sm font-inter-420-20 leading-[16px] tracking-[0.32px] text-gray-700',
              )}>
              {/* {getElapsedTimeFromNow(cellData.timestamp)} */}
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
                  'pl-1.5 font-inter-normal-24 text-md text-gray-900 leading-[17px] tracking-[0.32px]',
                )}>
                {/* {cellData.notification} */}
                {cellData.push_message_title}
              </Animated.Text>
            </Animated.View>
            {/* <Animated.View
              style={tailwind.style(
                'h-6 w-6 rounded-full justify-center items-center',
                cellData.notificationBgColor,
              )}>
              <Icon icon={cellData.notificationIcon} size={19.2} />
            </Animated.View> */}
          </Animated.View>
        </Animated.View>
      </Animated.View>
      {/* Possible animate the opacity */}
      {isRead && !showUnread ? (
        <Animated.View style={tailwind.style('absolute bg-white opacity-50 inset-0 z-20')} />
      ) : null}
    </Swipeable>
  );
};
