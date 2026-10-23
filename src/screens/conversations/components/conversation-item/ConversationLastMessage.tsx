import React from 'react';
import { StyleProp, Text, ViewStyle } from 'react-native';

import { tailwind } from '@/theme';
import { NativeView } from '@/components-next/native-components';
import {
  AudioIcon,
  CallIcon,
  ImageAttachmentIcon,
  DocumentAttachmentIcon,
  PrivateNoteIcon,
  OutgoingIcon,
} from '@/svg-icons';
import { Icon } from '@/components-next';
import { Message } from '@/types';
import { CONTENT_TYPES, MESSAGE_TYPES } from '@/constants';
import i18n from '@/i18n';
import { getPlainText } from '@/utils/messageFormatterUtils';
import { getVoiceCallDisplay } from '@/utils/voiceCallUtils';

// A call is previewed by its outcome: missed calls in red,
// live calls in green, everything else in the usual grey
const VoiceCallPreview = ({ message }: { message: Message }) => {
  const display = getVoiceCallDisplay(message);
  const color = display.isFailed
    ? (tailwind.color('text-ruby-800') as string)
    : display.isLive
      ? (tailwind.color('text-green-800') as string)
      : (tailwind.color('text-gray-900') as string);
  return (
    <NativeView style={tailwind.style('flex-row gap-1 items-center')}>
      <CallIcon color={color} size={14} />
      <Text
        numberOfLines={1}
        style={[
          tailwind.style('text-md flex-1 font-inter-420-20 tracking-[0.32px] leading-[21px]'),
          { color },
        ]}>
        {i18n.t(display.labelKey)}
      </Text>
    </NativeView>
  );
};

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
  const { contentAttributes } = message || {};
  const { email: { subject = '' } = {} } = contentAttributes || {};

  const lastMessageContent = getPlainText(subject || message?.content);

  const lastMessageFileType = message?.attachments?.[0]?.fileType;

  const isMessageSticker = message?.contentType === ('sticker' as Message['contentType']);

  if (message?.contentType === CONTENT_TYPES.VOICE_CALL) {
    return <VoiceCallPreview message={message} />;
  }

  if (message.content && isMessageSticker) {
    return (
      <NativeView style={tailwind.style('flex-row gap-1 items-center')}>
        <Icon icon={<ImageAttachmentIcon />} />
        <Text
          numberOfLines={1}
          style={tailwind.style(
            'text-md flex-1 font-inter-420-20 tracking-[0.32px] leading-[21px] text-gray-900',
          )}>
          <MessageType message={message} style={tailwind.style('ml-1')} />
          {i18n.t(`CONVERSATION.ATTACHMENTS.image.CONTENT`)}
        </Text>
      </NativeView>
    );
  } else if (lastMessageContent) {
    return (
      <NativeView style={tailwind.style('flex-row gap-1 items-center')}>
        <Text
          numberOfLines={numberOfLines}
          style={tailwind.style(
            'text-md flex-1 font-inter-420-20 tracking-[0.3px] leading-[21px] text-gray-900',
          )}>
          <MessageType message={message} style={tailwind.style('ml-1')} />
          <Text
            numberOfLines={numberOfLines}
            style={tailwind.style(
              'text-md flex-1 font-inter-420-20 tracking-[0.3px] leading-[21px] text-gray-900',
            )}>
            {lastMessageContent}
          </Text>
        </Text>
      </NativeView>
    );
  } else if (message.attachments) {
    return (
      <NativeView style={tailwind.style('flex-row gap-1 items-center')}>
        <Icon icon={getAttachmentIcon(lastMessageFileType)} />
        <MessageType message={message} />
        <Text
          numberOfLines={1}
          style={tailwind.style(
            'text-md flex-1 font-inter-420-20 tracking-[0.32px] leading-[21px] text-gray-900',
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
