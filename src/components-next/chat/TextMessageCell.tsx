import React, { useMemo } from 'react';
import { Alert } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import tailwind from 'twrnc';

import { CannedResponseIcon, CopyIcon, LinkIcon, TranslateIcon, Trash } from '@/svg-icons';
import { Message } from '@/types';
import { Avatar } from '@/components-next/common';

import { ActivityTextCell } from './ActivityTextCell';
import { BotTextCell } from './BotTextCell';
import { MenuOption, MessageMenu } from './message-menu';
import { MessageTextCell } from './MessageTextCell';
import { PrivateTextCell } from './PrivateTextCell';
import { MESSAGE_TYPES } from '@/constants';

export type TextMessageCellProps = {
  item: Message;
  handleQuoteReply: () => void;
};

export const TextMessageCell = (props: TextMessageCellProps) => {
  const messageItem = props.item as Message;
  const isIncoming = messageItem.messageType === MESSAGE_TYPES.INCOMING;
  const isOutgoing = messageItem.messageType === MESSAGE_TYPES.OUTGOING;
  const isActivity = messageItem.messageType === MESSAGE_TYPES.ACTIVITY;
  const isTemplate = messageItem.messageType === MESSAGE_TYPES.TEMPLATE;

  const { handleQuoteReply } = props;

  const sender = messageItem.sender;
  // This is a prop which is added after getting the Payload
  // so we might want to have two set of types for Message
  const { shouldRenderAvatar } = messageItem;

  const commonOptions = useMemo(
    () =>
      [
        {
          title: 'Reply',
          handleOnPressMenuOption: handleQuoteReply,
        },
        {
          title: 'Copy',
          icon: <CopyIcon />,
          handleOnPressMenuOption: () => Alert.alert('Copy'),
        },
        {
          title: 'Translate',
          icon: <TranslateIcon />,
          handleOnPressMenuOption: () => Alert.alert('Translate'),
        },
        {
          title: 'Copy link to message',
          icon: <LinkIcon />,
          handleOnPressMenuOption: () => Alert.alert('Copy link to message'),
        },
      ] as MenuOption[],
    [handleQuoteReply],
  );

  const outgoingMessageOptions = useMemo(
    () =>
      [
        ...commonOptions,
        {
          title: 'Add to canned responses',
          icon: <CannedResponseIcon />,
          handleOnPressMenuOption: () => Alert.alert('Add to canned responses'),
        },
        {
          title: 'Delete message',
          icon: <Trash />,
          handleOnPressMenuOption: () => Alert.alert('Delete message'),
          destructive: true,
        },
      ] as MenuOption[],
    [commonOptions],
  );

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
        <MessageMenu
          menuOptions={isActivity ? [] : isIncoming ? commonOptions : outgoingMessageOptions}>
          <React.Fragment>
            {messageItem.private ? (
              <React.Fragment>
                <PrivateTextCell text={messageItem.content} timeStamp={messageItem.createdAt} />
              </React.Fragment>
            ) : (
              <React.Fragment>
                {isIncoming || isOutgoing ? (
                  <MessageTextCell
                    {...{ isActivity, isIncoming, isOutgoing }}
                    text={messageItem.content}
                    timeStamp={messageItem.createdAt}
                    status={messageItem.status}
                    isAvatarRendered={shouldRenderAvatar}
                  />
                ) : null}
                {isTemplate ? (
                  <BotTextCell
                    text={messageItem.content}
                    timeStamp={messageItem.createdAt}
                    status={messageItem.status}
                    isAvatarRendered={shouldRenderAvatar}
                  />
                ) : null}
                {isActivity ? (
                  <ActivityTextCell text={messageItem.content} timeStamp={messageItem.createdAt} />
                ) : null}
              </React.Fragment>
            )}
          </React.Fragment>
        </MessageMenu>
        {sender?.thumbnail &&
        sender?.thumbnail.length >= 0 &&
        shouldRenderAvatar &&
        (messageItem.private || isOutgoing || isTemplate) ? (
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
