import React, { useMemo } from 'react';
import { Alert, Text } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { find, flatMap } from 'lodash';

import { useMessageList } from '../../../storev2';
import { CopyIcon, DoubleCheckIcon, LinkIcon, LockIcon, TranslateIcon } from '../../../svg-icons';
import { tailwind } from '../../../theme';
import { Message } from '../../../types';
import { unixTimestampToReadableTime } from '../../../utils';
import { Avatar, Icon } from '../../common';
import { MarkdownDisplay } from '../markdown';
import { MenuOption, MessageMenu } from '../message-menu';
import { TEXT_MAX_WIDTH } from '../MessagesList';
import { ReplyMessageCell } from '../reply-msg-cell';
import { MESSAGE_TYPES } from '../TextMessageCell';

import { AudioPlayer } from './AudioCell';
import { FilePreview } from './FileCell';
import { ImageContainer } from './ImageCell';
import { VideoPlayer } from './VideoCell';

type ComposedCellProps = {
  messageData: Message;
};

// TODO Add types from the store - not setting it now, might change when integrating it with Data layer
// @ts-ignore
function findMessageByIdLodash(messageList, messageId: number) {
  return find(flatMap(messageList, 'data'), { id: messageId });
}

export const ComposedCell = (props: ComposedCellProps) => {
  const {
    messageType,
    content,
    shouldRenderAvatar,
    sender,
    private: isPrivate,
    status,
    createdAt,
    contentAttributes,
  } = props.messageData as Message;

  const chatMessages = useMessageList(state => state.messageList);

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
        ? findMessageByIdLodash(chatMessages, contentAttributes?.inReplyTo)
        : {},
    [chatMessages, contentAttributes],
  );

  const commonOptions = useMemo(
    () =>
      [
        // {
        //   title: "Reply",
        //   handleOnPressMenuOption: () => Alert.alert("Reply"),
        // },
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
    [],
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
            <Avatar size={'md'} src={{ uri: sender?.thumbnail }} name={sender?.name} />
          </Animated.View>
        ) : null}

        <MessageMenu menuOptions={commonOptions}>
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
                {isReplyMessage ? (
                  <ReplyMessageCell {...{ replyMessage, isIncoming, isOutgoing }} />
                ) : null}
                <MarkdownDisplay {...{ isIncoming, isOutgoing }} messageContent={content} />
                {props.messageData.attachments.map((attachment, index) => {
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
                  {isOutgoing ? (
                    <Icon
                      icon={
                        <DoubleCheckIcon
                          renderSecondTick={status !== 'sent'}
                          stroke={
                            status === 'read'
                              ? tailwind.color('text-blue-800')
                              : tailwind.color('text-gray-700')
                          }
                        />
                      }
                      size={14}
                    />
                  ) : null}
                </Animated.View>
              </Animated.View>
            </Animated.View>
          </Animated.View>
        </MessageMenu>

        {sender?.thumbnail.length >= 0 &&
        shouldRenderAvatar &&
        (isPrivate || isOutgoing || isTemplate) ? (
          <Animated.View style={tailwind.style('flex items-end justify-end ml-1')}>
            <Avatar
              size={'md'}
              src={
                isTemplate
                  ? require('../../../assets/local/bot-avatar.png')
                  : { uri: sender?.thumbnail }
              }
              name={sender?.name}
            />
          </Animated.View>
        ) : null}
      </Animated.View>
    </Animated.View>
  );
};
