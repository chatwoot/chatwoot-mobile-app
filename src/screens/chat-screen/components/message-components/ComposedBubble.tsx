import React, { useMemo } from 'react';
import Animated from 'react-native-reanimated';

import { tailwind } from '@/theme';
import { Message } from '@/types';
import { Spinner } from '@/components-next';
import { ReplyMessageBubble } from './ReplyMessageBubble';

import { useAppSelector } from '@/hooks';
import { useChatWindowContext } from '@/context';
import { getMessagesByConversationId } from '@/store/conversation/conversationSelectors';
import { MESSAGE_STATUS } from '@/constants';
import { MarkdownBubble } from './MarkdownBubble';
import { MessageAttachments } from './MessageAttachments';

type ComposedBubbleProps = {
  item: Message;
  variant: string;
  orientation?: string;
};

export const ComposedBubble = (props: ComposedBubbleProps) => {
  const { content, private: isPrivate, contentAttributes, status } = props.item as Message;
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
        {isMessageSending && props.item.attachments && props.item.attachments.length > 0 && (
          <Animated.View style={tailwind.style('flex h-8 w-16 items-center justify-center')}>
            <Spinner size={12} stroke={tailwind.color('text-gray-900')} />
          </Animated.View>
        )}
        <MessageAttachments
          item={props.item}
          variant={props.variant}
          orientation={props.orientation}
        />
      </Animated.View>
    </Animated.View>
  );
};
