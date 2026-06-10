import React from 'react';
import Animated, { FadeIn } from 'react-native-reanimated';
import tailwind from 'twrnc';

import { Channel, Message } from '@/types';
import { Avatar } from '@/components-next/common';

import { ActivityTextCell } from './ActivityTextCell';
import { BotTextCell } from './BotTextCell';
import { MenuOption, MessageMenu } from '../message-menu';
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
    contentAttributes,
  } = messageItem;
  const { channel } = props;
  const isIncoming = messageItem.messageType === MESSAGE_TYPES.INCOMING;
  const isOutgoing = messageItem.messageType === MESSAGE_TYPES.OUTGOING;
  const isActivity = messageItem.messageType === MESSAGE_TYPES.ACTIVITY;
  const isTemplate = messageItem.messageType === MESSAGE_TYPES.TEMPLATE;
  const isSentByBot = !sender || ('type' in sender && sender.type === 'agent_bot');
  const errorMessage = contentAttributes?.externalError || '';

  const { menuOptions } = props;

  return (
    <Animated.View
      entering={FadeIn.duration(350)}
      style={[
        tailwind.style(
          'my-[1px]',
          isIncoming && 'items-start',
          isOutgoing && 'items-end',
          isTemplate && 'items-end',
          isActivity && 'items-center',
          !shouldRenderAvatar && isIncoming ? 'ml-7' : '',
          !shouldRenderAvatar && isOutgoing ? 'pr-7' : '',
          !shouldRenderAvatar && isTemplate ? 'pr-7' : '',
          shouldRenderAvatar ? 'mb-1' : '',
          messageItem.private ? 'my-2' : '',
        ),
      ]}>
      <Animated.View style={tailwind.style('flex flex-row')}>
        {sender && sender?.name && isIncoming && shouldRenderAvatar ? (
          <Animated.View style={tailwind.style('flex items-end justify-end mr-1')}>
            <Avatar
              size={'md'}
              src={sender?.thumbnail ? { uri: sender.thumbnail } : undefined}
              name={sender?.name || ''}
            />
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
                {(isOutgoing && !isSentByBot) || isIncoming ? (
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
                    errorMessage={errorMessage}
                    sender={sender}
                    contentAttributes={contentAttributes}
                  />
                ) : null}
                {(isOutgoing && isSentByBot) || isTemplate ? (
                  <BotTextCell
                    text={content}
                    timeStamp={createdAt}
                    status={messageItem.status}
                    isAvatarRendered={shouldRenderAvatar}
                    channel={channel}
                    messageType={messageType}
                    sourceId={sourceId || ''}
                    isPrivate={isPrivate}
                    errorMessage={errorMessage}
                  />
                ) : null}
                {isActivity ? <ActivityTextCell text={content} timeStamp={createdAt} /> : null}
              </React.Fragment>
            )}
          </React.Fragment>
        </MessageMenu>
        {shouldRenderAvatar && (isPrivate || isOutgoing || isTemplate) ? (
          <Animated.View style={tailwind.style('flex items-end justify-end ml-1')}>
            <Avatar
              size={'md'}
              src={
                isTemplate || isSentByBot
                  ? require('../../../../assets/local/bot-avatar.png') // eslint-disable-line @typescript-eslint/no-require-imports
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
