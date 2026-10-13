import React, { useMemo } from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

import { MESSAGE_VARIANTS, ORIENTATION } from '@/constants';
import { useChatWindowContext } from '@/context';
import { useAppSelector } from '@/hooks';
import { getMessagesByConversationId } from '@/store/conversation/conversationSelectors';
import { tailwind } from '@/theme';
import type { Message } from '@/types';

import { MarkdownBubble } from './MarkdownBubble';
import { MessageAttachments } from './MessageAttachments';
import { ReplyMessageBubble } from './ReplyMessageBubble';
import {
  getWhatsAppInteractivePresentation,
  type PresentationHeader,
} from './whatsAppInteractivePresentation';

type WhatsAppInteractiveBubbleProps = {
  item: Message;
  variant: string;
  orientation?: string;
};

const textColor = (variant: string) =>
  variant === MESSAGE_VARIANTS.USER || variant === MESSAGE_VARIANTS.ERROR
    ? 'text-white'
    : 'text-gray-700';

const Header = ({
  header,
  item,
  variant,
  orientation,
}: {
  header?: PresentationHeader;
  item: Message;
  variant: string;
  orientation?: string;
}) => {
  if (!header) {
    return null;
  }

  if (header.type === 'text') {
    return (
      <Animated.Text style={tailwind.style('font-inter-semibold-20 mb-1', textColor(variant))}>
        {header.text}
      </Animated.Text>
    );
  }

  if (!header.attachment) {
    return null;
  }

  return (
    <MessageAttachments
      item={{ ...item, attachments: [header.attachment] }}
      variant={variant}
      orientation={orientation}
    />
  );
};

const SupportingText = ({ children, variant }: { children?: string; variant: string }) =>
  children ? (
    <Animated.Text style={tailwind.style('text-xs mt-1', textColor(variant))}>
      {children}
    </Animated.Text>
  ) : null;

const ReplyContext = ({
  children,
  item,
  variant,
}: {
  children: React.ReactNode;
  item: Message;
  variant: string;
}) => {
  const { conversationId } = useChatWindowContext();
  const messages = useAppSelector(state => getMessagesByConversationId(state, { conversationId }));
  const replyMessage = useMemo(
    () =>
      item.contentAttributes?.inReplyTo
        ? messages.find(message => message.id === item.contentAttributes?.inReplyTo) || null
        : null,
    [item.contentAttributes?.inReplyTo, messages],
  );

  return (
    <Animated.View>
      {replyMessage ? <ReplyMessageBubble replyMessage={replyMessage} variant={variant} /> : null}
      {children}
    </Animated.View>
  );
};

export const WhatsAppInteractiveBubble = ({
  item,
  variant,
  orientation = ORIENTATION.LEFT,
}: WhatsAppInteractiveBubbleProps) => {
  const presentation = getWhatsAppInteractivePresentation(item);
  if (!presentation) {
    return null;
  }

  if (presentation.kind === 'fallback') {
    return (
      <ReplyContext item={item} variant={variant}>
        {presentation.content ? (
          <MarkdownBubble messageContent={presentation.content} variant={variant} />
        ) : null}
        <MessageAttachments item={item} variant={variant} orientation={orientation} />
      </ReplyContext>
    );
  }

  if (presentation.kind === 'reply') {
    return (
      <ReplyContext item={item} variant={variant}>
        <MarkdownBubble messageContent={presentation.title} variant={variant} />
        <SupportingText variant={variant}>{presentation.description}</SupportingText>
      </ReplyContext>
    );
  }

  return (
    <ReplyContext item={item} variant={variant}>
      <Header
        header={presentation.header}
        item={item}
        variant={variant}
        orientation={orientation}
      />
      {presentation.body ? (
        <MarkdownBubble messageContent={presentation.body} variant={variant} />
      ) : null}
      <SupportingText variant={variant}>{presentation.footer}</SupportingText>
      {presentation.kind === 'button' ? (
        <Animated.View style={tailwind.style('mt-2 gap-1')}>
          {presentation.buttons.map(button => (
            <Pressable
              key={button.deliveryId}
              accessibilityRole="button"
              accessibilityState={{ disabled: true }}
              disabled
              style={tailwind.style('border border-gray-300 rounded-lg px-3 py-2 opacity-70')}>
              <Animated.Text
                style={tailwind.style('text-center font-inter-medium-24', textColor(variant))}>
                {button.title}
              </Animated.Text>
            </Pressable>
          ))}
        </Animated.View>
      ) : (
        <Animated.View style={tailwind.style('mt-2 border border-gray-300 rounded-lg px-3 py-2')}>
          <Animated.Text
            style={tailwind.style('text-center font-inter-medium-24', textColor(variant))}>
            {presentation.button}
          </Animated.Text>
          <Animated.Text
            selectable
            style={tailwind.style('text-center text-xs mt-1', textColor(variant))}>
            {presentation.url}
          </Animated.Text>
        </Animated.View>
      )}
    </ReplyContext>
  );
};
