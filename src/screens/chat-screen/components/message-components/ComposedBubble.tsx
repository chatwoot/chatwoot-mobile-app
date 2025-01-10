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
import { ReplyMessageBubble } from './ReplyMessageBubble';
import { INBOX_TYPES, MESSAGE_TYPES, TEXT_MAX_WIDTH } from '@/constants';

import { AudioPlayer } from './AudioCell';
import { FilePreview } from './FileCell';
import { ImageContainer } from './ImageCell';
import { VideoPlayer } from './VideoCell';
import { DeliveryStatus } from './DeliveryStatus';
import { useAppSelector } from '@/hooks';
import { useChatWindowContext } from '@/context';
import { getMessagesByConversationId } from '@/store/conversation/conversationSelectors';
import { ATTACHMENT_TYPES } from '@/constants';
import i18n from '@/i18n';
import { MarkdownBubble } from './MarkdownBubble';

type ComposedBubbleProps = {
  messageData: Message;
  channel?: Channel;
  menuOptions: MenuOption[];
  variant: string;
};

const isMessageCreatedAtLessThan24HoursOld = (messageTimestamp: number) => {
  const currentTime = new Date();
  const messageTime = new Date(messageTimestamp * 1000);
  const hoursDifference = differenceInHours(currentTime, messageTime);

  return hoursDifference > 24;
};

export const ComposedBubble = (props: ComposedBubbleProps) => {
  const {
    messageType,
    content,
    private: isPrivate,
    createdAt,
    contentAttributes,
  } = props.messageData as Message;
  const { conversationId } = useChatWindowContext();

  const messages = useAppSelector(state => getMessagesByConversationId(state, { conversationId }));

  const isIncoming = messageType === MESSAGE_TYPES.INCOMING;
  const isOutgoing = messageType === MESSAGE_TYPES.OUTGOING;

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
  const { imageType } = contentAttributes || {};
  const isAnInstagramStory = imageType === ATTACHMENT_TYPES.STORY_MENTION;
  const isInstagramStoryExpired = isMessageCreatedAtLessThan24HoursOld(createdAt);

  return (
    <Animated.View style={tailwind.style('flex flex-row')}>
      {isPrivate ? (
        <Animated.View style={tailwind.style('w-[3px] bg-amber-700 h-auto rounded-[4px]')} />
      ) : null}
      <Animated.View style={tailwind.style(isPrivate ? 'pl-2.5' : '')}>
        {/* {isReplyMessage && replyMessage ? (
          <ReplyMessageBubble replyMessage={replyMessage} variant={props.variant} />
        ) : null} */}
        {content && <MarkdownBubble messageContent={content} variant={props.variant} />}
        {props.messageData.attachments &&
          props.messageData.attachments.map((attachment, index) => {
            // if (attachment.fileType === 'audio') {
            //   return (
            //     <Animated.View
            //       key={attachment.fileType + index}
            //       style={tailwind.style('flex-1 py-3 px-2 rounded-xl my-2')}>
            //       <AudioPlayer audioSrc={attachment.dataUrl} {...{ isIncoming, isOutgoing }} />
            //     </Animated.View>
            //   );
            // }
            if (attachment.fileType === 'image') {
              return isAnInstagramStory && isInstagramStoryExpired ? (
                <Animated.View
                  style={tailwind.style(
                    'flex flex-row items-center justify-center py-8 bg-slate-100 gap-1',
                  )}>
                  <Icon icon={<FileErrorIcon fill={tailwind.color('text-gray-900')} />} />
                  <Animated.Text
                    style={tailwind.style('text-cxs font-inter-420-20 text-gray-900 mt-[1px]')}>
                    {i18n.t('CONVERSATION.STORY_NOT_AVAILABLE')}
                  </Animated.Text>
                </Animated.View>
              ) : (
                <Animated.View key={attachment.fileType + index} style={tailwind.style('my-2')}>
                  <ImageContainer
                    imageSrc={attachment.dataUrl}
                    width={300 - 24 - (isPrivate ? 13 : 0)}
                    height={215}
                  />
                </Animated.View>
              );
            }
            // if (attachment.fileType === 'file') {
            //   return (
            //     <Animated.View
            //       key={attachment.fileType + index}
            //       style={tailwind.style('flex flex-row items-center relative max-w-[300px] my-2')}>
            //       <FilePreview
            //         fileSrc={attachment.dataUrl}
            //         isComposed
            //         {...{ isIncoming, isOutgoing }}
            //       />
            //     </Animated.View>
            //   );
            // }
            // if (attachment.fileType === 'video') {
            //   return (
            //     <Animated.View
            //       key={attachment.fileType + index}
            //       style={tailwind.style('flex flex-row items-center my-2')}>
            //       <VideoPlayer videoSrc={attachment.dataUrl} />
            //     </Animated.View>
            //   );
            // }
            return null;
          })}
      </Animated.View>
    </Animated.View>
  );
};
