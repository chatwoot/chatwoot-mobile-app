import React from 'react';
import { StyleProp, Text, ViewStyle } from 'react-native';

import { tailwind } from '@/theme';
import { NativeView } from '@/components-next/native-components';
import {
  AudioIcon,
  ImageAttachmentIcon,
  DocumentAttachmentIcon,
  PrivateNoteIcon,
  OutgoingIcon,
} from '@/svg-icons';
import { Icon } from '@/components-next';
import { Message } from '@/types';
import { MESSAGE_TYPES } from '@/constants';
import i18n from '@/i18n';
import { getPlainText } from '@/utils/messageFormatterUtils';
import { IOS_LIST_TEXT, useIOSListText } from '@/utils';

type ConversationLastMessageProps = {
  numberOfLines: number;
  lastMessage: Message;
};

export const ATTACHMENT_ICONS = {
  image: 'image',
  audio: 'headphones-sound-wave',
  video: 'video',
  file: 'document',
  location: 'location',
  fallback: 'link',
};

const getAttachmentIcon = (fileType: string) => {
  switch (fileType) {
    case 'image':
      return <ImageAttachmentIcon />;
    case 'audio':
      return <AudioIcon />;
    case 'file':
      return <DocumentAttachmentIcon />;
    default:
      return <DocumentAttachmentIcon />;
  }
};

// Shown inline before the preview text. On the iOS list layout callers add right padding
// (padding is part of an inline view's width, margins may not be) to separate it from the text.
const MessageType = ({ message, style }: { message: Message; style?: StyleProp<ViewStyle> }) => {
  const { private: isPrivate } = message;
  const isOutgoing = message?.messageType === MESSAGE_TYPES.OUTGOING;

  if (isOutgoing || isPrivate) {
    return (
      <NativeView style={[tailwind.style('flex-row items-center gap-1'), style]}>
        {isPrivate ? (
          <Icon icon={<PrivateNoteIcon />} />
        ) : (
          isOutgoing && <Icon icon={<OutgoingIcon />} />
        )}
      </NativeView>
    );
  }
  return null;
};

const MessageContent = ({
  message,
  numberOfLines,
}: {
  message: Message;
  numberOfLines: number;
}) => {
  const iosText = useIOSListText();
  const { contentAttributes } = message || {};
  const { email: { subject = '' } = {} } = contentAttributes || {};

  const lastMessageContent = getPlainText(subject || message?.content);

  const lastMessageFileType = message?.attachments?.[0]?.fileType;

  const isMessageSticker = message?.contentType === ('sticker' as Message['contentType']);

  if (message.content && isMessageSticker) {
    return (
      <NativeView style={tailwind.style('flex-row items-center', iosText ? 'gap-1.5' : 'gap-1')}>
        <Icon icon={<ImageAttachmentIcon />} />
        <Text
          numberOfLines={1}
          style={tailwind.style(
            'text-md flex-1 font-inter-420-20 tracking-[0.32px] leading-[21px] text-gray-900',
            iosText && IOS_LIST_TEXT.body,
          )}>
          <MessageType message={message} style={tailwind.style('ml-1', iosText && 'pr-1')} />
          {i18n.t(`CONVERSATION.ATTACHMENTS.image.CONTENT`)}
        </Text>
      </NativeView>
    );
  } else if (lastMessageContent) {
    return (
      <NativeView style={tailwind.style('flex-row items-center', iosText ? 'gap-1.5' : 'gap-1')}>
        <Text
          numberOfLines={numberOfLines}
          style={tailwind.style(
            'text-md flex-1 font-inter-420-20 tracking-[0.3px] leading-[21px] text-gray-900',
            iosText && IOS_LIST_TEXT.body,
          )}>
          <MessageType message={message} style={tailwind.style('ml-1', iosText && 'pr-1')} />
          <Text
            numberOfLines={numberOfLines}
            style={tailwind.style(
              'text-md flex-1 font-inter-420-20 tracking-[0.3px] leading-[21px] text-gray-900',
              iosText && IOS_LIST_TEXT.body,
            )}>
            {lastMessageContent}
          </Text>
        </Text>
      </NativeView>
    );
  } else if (message.attachments) {
    return (
      <NativeView style={tailwind.style('flex-row items-center', iosText ? 'gap-1.5' : 'gap-1')}>
        <Icon icon={getAttachmentIcon(lastMessageFileType)} />
        <MessageType message={message} />
        <Text
          numberOfLines={1}
          style={tailwind.style(
            'text-md flex-1 font-inter-420-20 tracking-[0.32px] leading-[21px] text-gray-900',
            iosText && IOS_LIST_TEXT.body,
          )}>
          {i18n.t(`CONVERSATION.ATTACHMENTS.${lastMessageFileType}.CONTENT`)}
        </Text>
      </NativeView>
    );
  }
  return (
    <Text
      style={tailwind.style(
        'text-md flex-1 font-inter-420-20 tracking-[0.32px] leading-[21px] text-gray-900',
        iosText && IOS_LIST_TEXT.body,
      )}>
      {i18n.t('CONVERSATION.NO_CONTENT')}
    </Text>
  );
};

export const ConversationLastMessage = (props: ConversationLastMessageProps) => {
  const { numberOfLines, lastMessage } = props;
  return (
    <NativeView style={tailwind.style('flex-1 flex-row gap-1 items-start')}>
      <MessageContent message={lastMessage} numberOfLines={numberOfLines} />
    </NativeView>
  );
};
