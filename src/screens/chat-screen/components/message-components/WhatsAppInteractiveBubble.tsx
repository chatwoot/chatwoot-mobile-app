import React, { useMemo, useRef } from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

import { Sheet, type SheetRef } from '@/components-next/common/sheet/Sheet';
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
  const listSheetRef = useRef<SheetRef>(null);
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
      ) : presentation.kind === 'list' ? (
        <>
          <Pressable
            accessibilityLabel={presentation.button}
            accessibilityRole="button"
            onPress={() => listSheetRef.current?.present()}
            style={tailwind.style('mt-2 border border-gray-300 rounded-lg px-3 py-2')}>
            <Animated.Text
              style={tailwind.style('text-center font-inter-medium-24', textColor(variant))}>
              {presentation.button}
            </Animated.Text>
          </Pressable>
          <Sheet
            ref={listSheetRef}
            detents={[0.7]}
            scrollable
            contentStyle={tailwind.style('px-4 pb-6')}>
            {presentation.sections.map(section => (
              <Animated.View key={section.rows[0].deliveryId} style={tailwind.style('mb-4')}>
                {section.title ? (
                  <Animated.Text
                    style={tailwind.style(
                      'text-base font-inter-semibold-20 text-gray-950 mb-1 px-1',
                    )}>
                    {section.title}
                  </Animated.Text>
                ) : null}
                {section.rows.map((row, index) => (
                  <Animated.View
                    key={row.deliveryId}
                    style={tailwind.style(
                      'px-3 py-3',
                      index !== section.rows.length - 1 ? 'border-b-[1px] border-b-blackA-A3' : '',
                    )}>
                    <Animated.Text
                      style={tailwind.style('text-sm font-inter-medium-24 text-gray-950')}>
                      {row.title}
                    </Animated.Text>
                    {row.description ? (
                      <Animated.Text style={tailwind.style('text-xs text-gray-700 mt-1')}>
                        {row.description}
                      </Animated.Text>
                    ) : null}
                  </Animated.View>
                ))}
              </Animated.View>
            ))}
          </Sheet>
        </>
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
