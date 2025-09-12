import React, { useMemo } from 'react';
import Animated from 'react-native-reanimated';

import { FileErrorIcon } from '@/svg-icons';
import { differenceInHours } from 'date-fns';
import { tailwind } from '@/theme';
import { Message } from '@/types';
import { Icon, Spinner } from '@/components-next';
import { ReplyMessageBubble } from './ReplyMessageBubble';

import { ImageBubbleContainer } from './ImageBubble';

import { useAppSelector } from '@/hooks';
import { useChatWindowContext } from '@/context';
import { getMessagesByConversationId } from '@/store/conversation/conversationSelectors';
import { ATTACHMENT_TYPES, MESSAGE_STATUS } from '@/constants';
import i18n from '@/i18n';
import { MarkdownBubble } from './MarkdownBubble';
import { FileBubblePreview } from './FileBubble';
import { AudioBubble } from './AudioBubble';
import { VideoBubble } from './VideoBubble';
import { LocationBubble } from './LocationBubble';

type ComposedBubbleProps = {
  item: Message;
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
    content,
    private: isPrivate,
    createdAt,
    contentAttributes,
    status,
  } = props.item as Message;
  const { conversationId } = useChatWindowContext();

  const messages = useAppSelector(state => getMessagesByConversationId(state, { conversationId }));

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
  const isMessageSending = status === MESSAGE_STATUS.PROGRESS;

  return (
    <Animated.View style={tailwind.style('flex flex-row')}>
      {isPrivate ? (
        <Animated.View style={tailwind.style('w-[3px] bg-amber-700 h-auto rounded-[4px]')} />
      ) : null}
      <Animated.View style={tailwind.style(isPrivate ? 'pl-2.5' : '')}>
        {isReplyMessage && replyMessage ? (
          <ReplyMessageBubble replyMessage={replyMessage} variant={props.variant} />
        ) : null}
        {content && <MarkdownBubble messageContent={content} variant={props.variant} />}
        {isMessageSending && (
          <Animated.View style={tailwind.style('flex h-8 w-16 items-center justify-center')}>
            <Spinner size={12} stroke={tailwind.color('text-gray-900')} />
          </Animated.View>
        )}
        {props.item.attachments &&
          props.item.attachments.map((attachment, index) => {
            if (attachment.fileType === 'image') {
              return isAnInstagramStory && isInstagramStoryExpired ? (
                <Animated.View
                  key={attachment.fileType + index}
                  style={tailwind.style(
                    'flex flex-row items-center justify-center py-8 bg-slate-100 gap-1 rounded-lg',
                  )}>
                  <Icon icon={<FileErrorIcon fill={tailwind.color('text-gray-900')} />} />
                  <Animated.Text
                    style={tailwind.style('text-cxs font-inter-420-20 text-gray-900 mt-[1px]')}>
                    {i18n.t('CONVERSATION.STORY_NOT_AVAILABLE')}
                  </Animated.Text>
                </Animated.View>
              ) : (
                <Animated.View key={attachment.fileType + index} style={tailwind.style('my-2')}>
                  <ImageBubbleContainer
                    imageSrc={attachment.dataUrl}
                    width={300 - 24 - (isPrivate ? 13 : 0)}
                    height={215}
                  />
                </Animated.View>
              );
            }

            if (attachment.fileType === ATTACHMENT_TYPES.FILE) {
              return (
                <Animated.View
                  key={attachment.fileType + index}
                  style={tailwind.style('flex flex-row items-center relative max-w-[300px] my-2')}>
                  <FileBubblePreview
                    fileSrc={attachment.dataUrl}
                    isComposed
                    variant={props.variant}
                  />
                </Animated.View>
              );
            }
            if (attachment.fileType === ATTACHMENT_TYPES.VIDEO) {
              return (
                <Animated.View
                  key={attachment.fileType + index}
                  style={tailwind.style('flex flex-row items-center my-2')}>
                  <VideoBubble videoSrc={attachment.dataUrl} />
                </Animated.View>
              );
            }
            if (attachment.fileType === ATTACHMENT_TYPES.IG_REEL) {
              return (
                <Animated.View
                  key={attachment.fileType + index}
                  style={tailwind.style('flex flex-row items-center my-2')}>
                  <VideoBubble videoSrc={attachment.dataUrl} />
                </Animated.View>
              );
            }
            if (attachment.fileType === ATTACHMENT_TYPES.AUDIO) {
              return (
                <Animated.View
                  key={attachment.fileType + index}
                  style={tailwind.style('flex flex-row items-center my-2')}>
                  <AudioBubble audioSrc={attachment.dataUrl} variant={props.variant} />
                </Animated.View>
              );
            }

            if (attachment.fileType === ATTACHMENT_TYPES.LOCATION) {
              return (
                <Animated.View
                  key={attachment.fileType + index}
                  style={tailwind.style('flex flex-row items-center my-2')}>
                  <LocationBubble
                    latitude={attachment.coordinatesLat}
                    longitude={attachment.coordinatesLong}
                    variant={props.variant}
                  />
                </Animated.View>
              );
            }

            return null;
          })}
      </Animated.View>
    </Animated.View>
  );
};
