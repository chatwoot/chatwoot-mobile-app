import React from 'react';
import Animated, { FadeIn } from 'react-native-reanimated';
import tailwind from 'twrnc';

import { Channel, Message } from '@/types';
import { Avatar } from '@/components-next/common';

import { ActivityTextCell } from './ActivityTextCell';
import { BotTextCell } from './BotTextCell';
import { MenuOption, MessageMenu } from './message-menu';
import { MessageTextCell } from './MessageTextCell';
import { PrivateTextCell } from './PrivateTextCell';
import { MESSAGE_TYPES } from '@/constants';

export type TextMessageCellProps = {
  item: Message;
  channel?: Channel;
  menuOptions: MenuOption[];
};

export const TextMessageCell = (props: TextMessageCellProps) => {
  const messageItem = props.item as Message;

  const {
    messageType,
    shouldRenderAvatar,
    sender,
    private: isPrivate,
    status,
    sourceId,
    content,
    createdAt,
  } = messageItem;
  const { channel } = props;
  const isIncoming = messageItem.messageType === MESSAGE_TYPES.INCOMING;
  const isOutgoing = messageItem.messageType === MESSAGE_TYPES.OUTGOING;
  const isActivity = messageItem.messageType === MESSAGE_TYPES.ACTIVITY;
  const isTemplate = messageItem.messageType === MESSAGE_TYPES.TEMPLATE;

  const { menuOptions } = props;

  return (
    <Animated.View
      entering={FadeIn.duration(350)}
      style={[
        tailwind.style(
          'my-[1px]',
          isIncoming ? 'items-start ml-3' : '',
          isOutgoing ? 'items-end pr-3' : '',
          isTemplate ? 'items-end pr-3' : '',
          isActivity ? 'items-center' : '',
          !shouldRenderAvatar && isIncoming ? 'ml-10' : '',
          !shouldRenderAvatar && isOutgoing ? 'pr-10' : '',
          !shouldRenderAvatar && isTemplate ? 'pr-10' : '',
          shouldRenderAvatar ? 'mb-2' : '',
          messageItem.private ? 'my-6' : '',
        ),
      ]}>
      <Animated.View style={tailwind.style('flex flex-row')}>
        {sender?.thumbnail && isIncoming && shouldRenderAvatar ? (
          <Animated.View style={tailwind.style('flex items-end justify-end mr-1')}>
            <Avatar size={'md'} src={{ uri: sender?.thumbnail }} name={sender?.name || ''} />
          </Animated.View>
        ) : null}
        <MessageMenu menuOptions={menuOptions}>
          <React.Fragment>
            {isPrivate ? (
              <React.Fragment>
                <PrivateTextCell text={content} timeStamp={createdAt} />
              </React.Fragment>
            ) : (
              <React.Fragment>
                {isIncoming || isOutgoing ? (
                  <MessageTextCell
                    {...{ isActivity, isIncoming, isOutgoing }}
                    text={content}
                    timeStamp={createdAt}
                    status={status}
                    isAvatarRendered={shouldRenderAvatar}
                    channel={channel}
                    messageType={messageType}
                    sourceId={sourceId || ''}
                    isPrivate={isPrivate}
                  />
                ) : null}
                {isTemplate ? (
                  <BotTextCell
                    text={content}
                    timeStamp={createdAt}
                    status={messageItem.status}
                    isAvatarRendered={shouldRenderAvatar}
                    channel={channel}
                    messageType={messageType}
                    sourceId={sourceId || ''}
                    isPrivate={isPrivate}
                  />
                ) : null}
                {isActivity ? <ActivityTextCell text={content} timeStamp={createdAt} /> : null}
              </React.Fragment>
            )}
          </React.Fragment>
        </MessageMenu>
        {sender?.thumbnail &&
        sender?.thumbnail.length >= 0 &&
        shouldRenderAvatar &&
        (isPrivate || isOutgoing || isTemplate) ? (
          <Animated.View style={tailwind.style('flex items-end justify-end ml-1')}>
            <Avatar
              size={'md'}
              src={
                isTemplate
                  ? require('../../assets/local/bot-avatar.png')
                  : { uri: sender?.thumbnail }
              }
              name={sender?.name || ''}
            />
          </Animated.View>
        ) : null}
      </Animated.View>
    </Animated.View>
  );
};
