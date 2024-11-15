import React from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';

import { tailwind } from '@/theme';
import { Message } from '@/types';

import {
  AudioCell,
  ComposedCell,
  FileCell,
  ImageCell,
  VideoCell,
} from '@/components-next/chat/message-components';

import { FlashListRenderProps } from '../MessagesList';
import { TextMessageCell } from '@/components-next/chat/TextMessageCell';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { selectConversationById } from '@/store/conversation/conversationSelectors';
import { useChatWindowContext } from '@/context';
import { setQuoteMessage } from '@/store/conversation/sendMessageSlice';

type StickySectionProps = { item: { date: string } };

const StickySection = ({ item }: StickySectionProps) => {
  return (
    <Animated.View style={tailwind.style('flex flex-row justify-center items-center py-5')}>
      <Animated.View style={tailwind.style('rounded-lg py-1 px-[7px] bg-blackA-A3')}>
        <Animated.Text
          style={tailwind.style(
            'text-cxs font-inter-420-20 tracking-[0.32px] text-blackA-A11 leading-[15px]',
          )}>
          {item.date}
        </Animated.Text>
      </Animated.View>
    </Animated.View>
  );
};

export const MessageItem = (props: FlashListRenderProps) => {
  const dispatch = useAppDispatch();
  const { conversationId } = useChatWindowContext();
  const handleQuoteReplyAttachment = () => {
    dispatch(setQuoteMessage(props.item as Message));
    // TODO: Add text input focus which now is a little janky
  };

  const { item, index } = props;
  const messageItem = item as Message;

  const conversation = useAppSelector(state => selectConversationById(state, conversationId));

  const {
    messageType,
    private: isPrivate,
    sourceId,
    createdAt,
    status,
    shouldRenderAvatar,
    sender,
  } = messageItem;
  const channel = conversation?.meta?.channel;

  const isReplyMessage = messageItem.contentAttributes?.inReplyTo;

  if ('date' in item) {
    return <StickySection {...{ item }} />;
  } else {
    const attachments = item?.attachments;
    // Message has only one attachment, no content and not a reply message
    if (item?.attachments?.length === 1 && !item.content && !isReplyMessage) {
      switch (attachments[0].fileType) {
        case 'image':
          return (
            <ImageCell
              sender={sender}
              timeStamp={createdAt}
              shouldRenderAvatar={shouldRenderAvatar}
              messageType={messageType}
              isPrivate={isPrivate}
              channel={channel}
              sourceId={sourceId}
              imageSrc={attachments[0].dataUrl}
              status={status}
              handleQuoteReply={handleQuoteReplyAttachment}
            />
          );
        case 'audio':
          return (
            <AudioCell
              audioSrc={attachments[0].dataUrl}
              sender={item.sender}
              timeStamp={item.createdAt}
              shouldRenderAvatar={item.shouldRenderAvatar}
              messageType={item.messageType}
              status={item.status}
              isPrivate={isPrivate}
              channel={channel}
              sourceId={sourceId}
              handleQuoteReply={handleQuoteReplyAttachment}
            />
          );

        case 'video':
          return (
            <VideoCell
              sender={item.sender}
              videoSrc={attachments[0].dataUrl}
              shouldRenderAvatar={item.shouldRenderAvatar}
              timeStamp={item.createdAt}
              messageType={item.messageType}
              status={item.status}
              isPrivate={isPrivate}
              channel={channel}
              sourceId={sourceId}
              handleQuoteReply={handleQuoteReplyAttachment}
            />
          );
        case 'file':
          return (
            <FileCell
              fileSrc={attachments[0].dataUrl}
              shouldRenderAvatar={item.shouldRenderAvatar}
              timeStamp={item.createdAt}
              messageType={item.messageType}
              status={item.status}
              isPrivate={isPrivate}
              channel={channel}
              sourceId={sourceId}
              sender={sender}
              handleQuoteReply={handleQuoteReplyAttachment}
            />
          );
        default:
          return null;
      }
    } else if (item?.attachments?.length >= 1 || isReplyMessage) {
      return <ComposedCell messageData={item} channel={channel} />;
    } else if ('content' in item && item.content) {
      // Check if 'content' exists in 'item' (i.e., it's a message item)
      return <TextMessageCell {...{ item, index }} handleQuoteReply={handleQuoteReplyAttachment} />;
    } else {
      return <View />;
    }
  }
};
