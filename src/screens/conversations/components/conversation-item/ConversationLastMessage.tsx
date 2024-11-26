import React from 'react';
import { Text, View } from 'react-native';

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

const MessageType = ({ message }: { message: Message }) => {
  const { private: isPrivate } = message;
  const isOutgoing = message?.messageType === MESSAGE_TYPES.OUTGOING;

  if (isOutgoing || isPrivate) {
    return (
      <View style={tailwind.style('flex-row items-center mr-2 gap-1')}>
        {isPrivate ? (
          <Icon icon={<PrivateNoteIcon />} />
        ) : (
          isOutgoing && <Icon icon={<OutgoingIcon />} />
        )}
      </View>
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
  const { contentAttributes } = message || {};
  const { email: { subject = '' } = {} } = contentAttributes || {};

  const lastMessageContent = getPlainText(subject || message?.content);

  const lastMessageFileType = message?.attachments?.[0]?.fileType;

  const isMessageSticker = message?.contentType === ('sticker' as Message['contentType']);

  console.log('message', lastMessageContent);

  if (message.content && isMessageSticker) {
    return (
      <NativeView style={tailwind.style('flex-row gap-1 items-center')}>
        <Icon icon={<ImageAttachmentIcon />} />
        <Text
          numberOfLines={1}
          style={tailwind.style(
            'text-md flex-1 font-inter-420-20 tracking-[0.32px] leading-[21px] text-gray-900',
          )}>
          <MessageType message={message} />
          {i18n.t(`CONVERSATION.ATTACHMENTS.image.CONTENT`)}
        </Text>
      </NativeView>
    );
  } else if (lastMessageContent) {
    return (
      <Text
        numberOfLines={numberOfLines}
        style={tailwind.style(
          'text-md flex-1 font-inter-420-20 tracking-[0.32px] leading-[21px] text-gray-900',
        )}>
        <MessageType message={message} />
        {lastMessageContent}
      </Text>
    );
  } else if (message.attachments) {
    return (
      <NativeView style={tailwind.style('flex-row gap-1 items-center')}>
        <Icon icon={getAttachmentIcon(lastMessageFileType)} />
        <Text
          numberOfLines={1}
          style={tailwind.style(
            'text-md flex-1 font-inter-420-20 tracking-[0.32px] leading-[21px] text-gray-900',
          )}>
          <MessageType message={message} />
          {i18n.t(`CONVERSATION.ATTACHMENTS.${lastMessageFileType}.CONTENT`)}
        </Text>
      </NativeView>
    );
  }
  return <Text>{i18n.t('CONVERSATION.NO_CONTENT')}</Text>;
};

export const ConversationLastMessage = (props: ConversationLastMessageProps) => {
  const { numberOfLines, lastMessage } = props;
  return (
    <NativeView style={tailwind.style('flex-1 flex-row gap-1 items-start')}>
      <MessageContent message={lastMessage} numberOfLines={numberOfLines} />
    </NativeView>
  );
};
