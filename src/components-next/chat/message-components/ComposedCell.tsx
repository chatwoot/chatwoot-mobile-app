import React, { useMemo } from 'react';
import { Text } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { LockIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import { Channel, Message } from '@/types';
import { unixTimestampToReadableTime } from '@/utils';
import { Avatar, Icon } from '@/components-next';
import { MarkdownDisplay } from '../markdown';
import { MenuOption, MessageMenu } from '../message-menu';
import { TEXT_MAX_WIDTH } from '@/constants';
import { ReplyMessageCell } from '../reply-msg-cell';
import { MESSAGE_TYPES } from '@/constants';

import { AudioPlayer } from './AudioCell';
import { FilePreview } from './FileCell';
import { ImageContainer } from './ImageCell';
import { VideoPlayer } from './VideoCell';
import { useAppSelector } from '@/hooks';
import { getMessagesByConversationId } from '@/store/conversation/conversationSelectors';
import { useChatWindowContext } from '@/context';
import { DeliveryStatus } from './DeliveryStatus';

type ComposedCellProps = {
  messageData: Message;
  channel?: Channel;
  menuOptions: MenuOption[];
};

export const ComposedCell = (props: ComposedCellProps) => {
  const {
    messageType,
    content,
    shouldRenderAvatar,
    sender,
    private: isPrivate,
    status,
    sourceId,
    createdAt,
    contentAttributes,
  } = props.messageData as Message;
  const { channel, menuOptions } = props;
  const { conversationId } = useChatWindowContext();

  const messages = useAppSelector(state => getMessagesByConversationId(state, { conversationId }));

  const isIncoming = messageType === MESSAGE_TYPES.INCOMING;
  const isOutgoing = messageType === MESSAGE_TYPES.OUTGOING;
  const isActivity = messageType === MESSAGE_TYPES.ACTIVITY;
  const isTemplate = messageType === MESSAGE_TYPES.TEMPLATE;

  const isReplyMessage = useMemo(
    () => contentAttributes?.inReplyTo !== undefined,
    [contentAttributes?.inReplyTo],
  );

  const replyMessage = useMemo(
    () =>
      contentAttributes && contentAttributes?.inReplyTo
        ? messages.find(message => message.id === contentAttributes?.inReplyTo) || null
        : null,
    [messages, contentAttributes],
  );

  return (
    <Animated.View
      entering={FadeIn.duration(350)}
      style={tailwind.style(
        'my-[1px]',
        isIncoming ? 'items-start ml-3' : '',
        isOutgoing ? 'items-end pr-3' : '',
        isTemplate ? 'items-end pr-3' : '',
        isActivity ? 'items-center' : '',
        !shouldRenderAvatar && isIncoming ? 'ml-10' : '',
        !shouldRenderAvatar && isOutgoing ? 'pr-10' : '',
        !shouldRenderAvatar && isTemplate ? 'pr-10' : '',
        shouldRenderAvatar ? 'mb-2' : '',
        isPrivate ? 'my-6' : '',
      )}>
      <Animated.View style={tailwind.style('flex flex-row')}>
        {sender?.thumbnail && isIncoming && shouldRenderAvatar ? (
          <Animated.View style={tailwind.style('flex items-end justify-end mr-1')}>
            <Avatar size={'md'} src={{ uri: sender?.thumbnail }} name={sender?.name || ''} />
          </Animated.View>
        ) : null}

        <MessageMenu menuOptions={menuOptions}>
          <Animated.View
            style={[
              tailwind.style(
                'relative pl-3 pr-2.5 py-2 rounded-2xl overflow-hidden',
                `max-w-[${TEXT_MAX_WIDTH}px]`,
                isIncoming ? 'bg-blue-700' : '',
                isOutgoing ? 'bg-gray-100' : '',
                isPrivate ? ' bg-amber-100' : '',
                shouldRenderAvatar
                  ? isOutgoing
                    ? 'rounded-br-none'
                    : isIncoming
                      ? 'rounded-bl-none'
                      : ''
                  : '',
              ),
            ]}>
            <Animated.View style={tailwind.style('flex flex-row')}>
              {isPrivate ? (
                <Animated.View
                  style={tailwind.style('w-[3px] bg-amber-700 h-auto rounded-[4px]')}
                />
              ) : null}
              <Animated.View style={tailwind.style(isPrivate ? 'pl-2.5' : '')}>
                {isReplyMessage && replyMessage ? (
                  <ReplyMessageCell {...{ replyMessage, isIncoming, isOutgoing }} />
                ) : null}
                {content && (
                  <MarkdownDisplay {...{ isIncoming, isOutgoing }} messageContent={content} />
                )}
                {/* TODO: Implement this later */}
                {props.messageData.attachments &&
                  props.messageData.attachments.map((attachment, index) => {
                    if (attachment.fileType === 'audio') {
                      return (
                        <Animated.View
                          key={attachment.fileType + index}
                          style={tailwind.style('flex-1 py-3 px-2 rounded-xl my-2')}>
                          <AudioPlayer
                            audioSrc={attachment.dataUrl}
                            {...{ isIncoming, isOutgoing }}
                          />
                        </Animated.View>
                      );
                    }
                    if (attachment.fileType === 'image') {
                      return (
                        <Animated.View
                          key={attachment.fileType + index}
                          style={tailwind.style('flex-1 my-2')}>
                          <ImageContainer
                            imageSrc={attachment.dataUrl}
                            width={300 - 24 - (isPrivate ? 13 : 0)}
                            height={215}
                          />
                        </Animated.View>
                      );
                    }
                    if (attachment.fileType === 'file') {
                      return (
                        <Animated.View
                          key={attachment.fileType + index}
                          style={tailwind.style(
                            'flex flex-row items-center relative max-w-[300px] my-2',
                          )}>
                          <FilePreview
                            fileSrc={attachment.dataUrl}
                            isComposed
                            {...{ isIncoming, isOutgoing }}
                          />
                        </Animated.View>
                      );
                    }
                    if (attachment.fileType === 'video') {
                      return (
                        <Animated.View
                          key={attachment.fileType + index}
                          style={tailwind.style('flex flex-row items-center my-2')}>
                          <VideoPlayer videoSrc={attachment.dataUrl} />
                        </Animated.View>
                      );
                    }
                    return null;
                  })}
                <Animated.View
                  style={tailwind.style(
                    'h-[21px] pt-[5px] pb-0.5 flex flex-row items-center justify-end',
                    // singleLineShortText ? "pl-1.5" : "",
                    // singleLineLongText || isMultiLine ? "justify-end" : "",
                    // multiLineShortText ? " absolute bottom-0.5 right-2.5" : "",
                  )}>
                  {isPrivate ? <Icon icon={<LockIcon />} size={12} /> : null}
                  <Text
                    style={tailwind.style(
                      'text-xs font-inter-420-20 tracking-[0.32px] pr-1',
                      isIncoming ? 'text-whiteA-A11' : '',
                      isOutgoing ? 'text-gray-700' : '',
                      isPrivate ? 'pl-1' : '',
                    )}>
                    {unixTimestampToReadableTime(createdAt)}
                  </Text>
                  <DeliveryStatus
                    isPrivate={isPrivate}
                    status={status}
                    messageType={messageType}
                    channel={channel}
                    sourceId={sourceId}
                    deliveredColor="text-gray-700"
                    sentColor="text-gray-700"
                  />
                </Animated.View>
              </Animated.View>
            </Animated.View>
          </Animated.View>
        </MessageMenu>

        {sender?.thumbnail && shouldRenderAvatar && (isPrivate || isOutgoing || isTemplate) ? (
          <Animated.View style={tailwind.style('flex items-end justify-end ml-1')}>
            <Avatar
              size={'md'}
              src={
                isTemplate
                  ? require('../../../assets/local/bot-avatar.png')
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
