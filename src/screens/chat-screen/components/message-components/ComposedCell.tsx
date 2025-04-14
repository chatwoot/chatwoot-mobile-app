import React, { useMemo } from 'react';
import { Text, Dimensions } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { FileErrorIcon, LockIcon } from '@/svg-icons';
import { differenceInHours } from 'date-fns';
import { tailwind } from '@/theme';
import { Channel, Message } from '@/types';
import { unixTimestampToReadableTime } from '@/utils';
import { Avatar, Icon } from '@/components-next';
import { MarkdownDisplay } from './MarkdownDisplay';
import { MenuOption, MessageMenu } from '../message-menu';
import { ReplyMessageCell } from './ReplyMessageCell';
import { INBOX_TYPES, MESSAGE_TYPES, TEXT_MAX_WIDTH } from '@/constants';

import { AudioPlayer } from './AudioCell';
import { FilePreview } from './FileCell';

import { VideoPlayer } from './VideoCell';
import { DeliveryStatus } from './DeliveryStatus';
import { useAppSelector } from '@/hooks';
import { useChatWindowContext } from '@/context';
import { getMessagesByConversationId } from '@/store/conversation/conversationSelectors';
import { ATTACHMENT_TYPES } from '@/constants';
import i18n from '@/i18n';

type ComposedCellProps = {
  messageData: Message;
  channel?: Channel;
  menuOptions: MenuOption[];
};

const isMessageCreatedAtLessThan24HoursOld = (messageTimestamp: number) => {
  const currentTime = new Date();
  const messageTime = new Date(messageTimestamp * 1000);
  const hoursDifference = differenceInHours(currentTime, messageTime);

  return hoursDifference > 24;
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
  // const replyMessage = null;
  const errorMessage = contentAttributes?.externalError || '';
  const { imageType } = contentAttributes || {};
  const isAnInstagramStory = imageType === ATTACHMENT_TYPES.STORY_MENTION;
  const isInstagramStoryExpired = isMessageCreatedAtLessThan24HoursOld(createdAt);

  const isEmailMessage = channel === INBOX_TYPES.EMAIL;

  const windowWidth = Dimensions.get('window').width;

  const EMAIL_MESSAGE_WIDTH = windowWidth - 52; // 52 is the sum of the left and right padding (12 + 12) and avatar width (24) and gap between avatar and message (4)

  return (
    <Animated.View
      entering={FadeIn.duration(350)}
      style={tailwind.style(
        'my-[1px]',
        isIncoming && 'items-start',
        isOutgoing && 'items-end',
        isTemplate && 'items-end',
        isEmailMessage && 'items-start',
        isActivity ? 'items-center' : '',
        !shouldRenderAvatar && isIncoming ? 'ml-7' : '',
        !shouldRenderAvatar && isOutgoing ? 'pr-7' : '',
        !shouldRenderAvatar && isTemplate ? 'pr-7' : '',
        shouldRenderAvatar ? 'mb-2' : '',
        isPrivate ? 'my-6' : '',
      )}>
      <Animated.View style={tailwind.style('flex flex-row')}>
        {sender?.name && isIncoming && shouldRenderAvatar ? (
          <Animated.View style={tailwind.style('flex items-end justify-end mr-1')}>
            <Avatar size={'md'} src={{ uri: sender?.thumbnail }} name={sender?.name || ''} />
          </Animated.View>
        ) : null}

        <MessageMenu menuOptions={menuOptions}>
          <Animated.View
            style={[
              tailwind.style(
                'relative pl-3 pr-2.5 py-2 h-full rounded-2xl overflow-hidden',
                isEmailMessage ? `max-w-[${EMAIL_MESSAGE_WIDTH}px]` : `max-w-[${TEXT_MAX_WIDTH}px]`,
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
                    errorMessage={errorMessage || ''}
                    deliveredColor="text-gray-700"
                    sentColor="text-gray-700"
                  />
                </Animated.View>
              </Animated.View>
            </Animated.View>
          </Animated.View>
        </MessageMenu>

        {shouldRenderAvatar && (isPrivate || isOutgoing || isTemplate) ? (
          <Animated.View style={tailwind.style('flex items-end justify-end ml-1')}>
            <Avatar
              size={'md'}
              src={
                isTemplate
                  ? require('../../../../assets/local/bot-avatar.png')
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
