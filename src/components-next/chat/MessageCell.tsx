import React, { useMemo } from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';

import { useSendMessage } from '../../storev2';
import { tailwind } from '../../theme';
import { Message } from '../../types';

import { AudioCell, ComposedCell, FileCell, ImageCell, VideoCell } from './message-components';
import { FlashListRenderProps } from './MessagesList';
import { TextMessageCell } from './TextMessageCell';

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

export const MessageCell = (props: FlashListRenderProps) => {
  const { setQuoteMessage } = useSendMessage();

  const handleQuoteReplyAttachment = () => {
    setQuoteMessage(props.item as Message);
    // TODO: Add text input focus which now is a little janky
  };

  const { item, index } = props;
  const messageItem = item as Message;

  const isReplyMessage = useMemo(
    () =>
      messageItem.contentAttributes &&
      Object.keys(messageItem.contentAttributes).length > 0 &&
      Object.keys(messageItem.contentAttributes).includes('inReplyTo'),
    [messageItem.contentAttributes],
  );

  if ('date' in item) {
    // Check if 'section' exists in 'item' (i.e., it's a section item)
    return <StickySection {...{ item }} />;
  } else {
    // Message has only one attachment and no content
    if (item?.attachments?.length === 1 && !item.content && !isReplyMessage) {
      switch (item.attachments[0].fileType) {
        case 'audio':
          return (
            <AudioCell
              audioSrc={item.attachments[0].dataUrl}
              senderDetails={item.sender}
              timeStamp={item.createdAt}
              shouldRenderAvatar={item.shouldRenderAvatar}
              messageType={item.messageType}
              status={item.status}
              handleQuoteReply={handleQuoteReplyAttachment}
            />
          );
        case 'image':
          return (
            <ImageCell
              senderDetails={item.sender}
              timeStamp={item.createdAt}
              shouldRenderAvatar={item.shouldRenderAvatar}
              messageType={item.messageType}
              imageSrc={item.attachments[0].dataUrl}
              status={item.status}
              handleQuoteReply={handleQuoteReplyAttachment}
            />
          );
        case 'video':
          return (
            <VideoCell
              senderDetails={item.sender}
              videoSrc={item.attachments[0].dataUrl}
              shouldRenderAvatar={item.shouldRenderAvatar}
              messageType={item.messageType}
              timeStamp={item.createdAt}
              status={item.status}
              handleQuoteReply={handleQuoteReplyAttachment}
            />
          );
        case 'file':
          return (
            <FileCell
              senderDetails={item.sender}
              fileSrc={item.attachments[0].dataUrl}
              shouldRenderAvatar={item.shouldRenderAvatar}
              messageType={item.messageType}
              timeStamp={item.createdAt}
              status={item.status}
              handleQuoteReply={handleQuoteReplyAttachment}
            />
          );
      }
    } else if (item?.attachments?.length >= 1 || isReplyMessage) {
      return <ComposedCell messageData={item} />;
    } else if ('content' in item && item.content) {
      // Check if 'content' exists in 'item' (i.e., it's a message item)
      return <TextMessageCell {...{ item, index }} handleQuoteReply={handleQuoteReplyAttachment} />;
    } else {
      return <View />;
    }
  }
};
