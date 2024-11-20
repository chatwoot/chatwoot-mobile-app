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
import Clipboard from '@react-native-clipboard/clipboard';

import { FlashListRenderProps } from '../MessagesList';
import { TextMessageCell } from '@/components-next/chat/TextMessageCell';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { selectConversationById } from '@/store/conversation/conversationSelectors';
import { useChatWindowContext } from '@/context';
import { setQuoteMessage } from '@/store/conversation/sendMessageSlice';
// import { CannedResponseIcon, CopyIcon, LinkIcon, TranslateIcon, Trash } from '@/svg-icons';
import { CopyIcon, Trash } from '@/svg-icons';
import { MESSAGE_TYPES } from '@/constants';
import { MenuOption } from '@/components-next/chat/message-menu';
import { INBOX_FEATURES, inboxHasFeature, is360DialogWhatsAppChannel, useHaptic } from '@/utils';
import { showToast } from '@/helpers/ToastHelper';
import i18n from '@/i18n';
import { conversationActions } from '@/store/conversation/conversationActions';

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
  const hapticSelection = useHaptic();

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
    contentAttributes,
  } = messageItem;
  const channel = conversation?.meta?.channel;

  const hasText = !!messageItem.content;

  const hasAttachments = !!(messageItem.attachments && messageItem.attachments.length > 0);

  const isDeleted = contentAttributes?.deleted;

  // Why not use the inReplyTo object directly?
  // The inReplyTo object may or may not be available
  // depending on the current scroll position of the message list
  // since old messages are only loaded when the user scrolls up
  const isReplyMessage = messageItem.contentAttributes?.inReplyTo;

  const handleCopyMessage = () => {
    const value = messageItem.content;
    hapticSelection?.();
    if (value) {
      Clipboard.setString(value);
      showToast({ message: i18n.t('CONVERSATION.COPY_MESSAGE') });
    }
  };

  const handleDeleteMessage = () => {
    dispatch(conversationActions.deleteMessage({ conversationId, messageId: messageItem.id }));
  };

  const inboxSupportsReplyTo = () => {
    {
      const incoming = inboxHasFeature(INBOX_FEATURES.REPLY_TO, channel);
      const outgoing =
        inboxHasFeature(INBOX_FEATURES.REPLY_TO_OUTGOING, channel) &&
        !is360DialogWhatsAppChannel(channel);

      return { incoming, outgoing };
    }
  };

  const getMenuOptions = (messageType: number): MenuOption[] => {
    const menuOptions: MenuOption[] = [];
    if (messageType === MESSAGE_TYPES.ACTIVITY || isDeleted) {
      return [];
    }
    // menuOptions.push({
    //   title: 'Copy link to message',
    //   icon: <LinkIcon />,
    //   handleOnPressMenuOption: handleCopyLink,
    //   destructive: false
    // })
    if (hasText) {
      menuOptions.push({
        title: 'Copy',
        icon: <CopyIcon />,
        handleOnPressMenuOption: handleCopyMessage,
        destructive: false,
      });
      // menuOptions.push({
      //   title: 'Translate',
      //   icon: <TranslateIcon />,
      //   handleOnPressMenuOption: handleTranslateMessage,
      //   destructive: false,
      // });
    }
    if (!isPrivate && inboxSupportsReplyTo().outgoing) {
      menuOptions.push({
        title: 'Reply',
        icon: null,
        handleOnPressMenuOption: handleQuoteReplyAttachment,
        destructive: false,
      });
    }
    if (hasAttachments || hasText) {
      menuOptions.push({
        title: 'Delete message',
        icon: <Trash />,
        handleOnPressMenuOption: handleDeleteMessage,
        destructive: true,
      });
    }

    // if (hasText && isOutgoing) {
    //   menuOptions.push({
    //     title: 'Add to canned responses',
    //     icon: <CannedResponseIcon />,
    //     handleOnPressMenuOption: handleTranslateMessage,
    //     destructive: false,
    //   });
    // }

    return menuOptions;
  };

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
              menuOptions={getMenuOptions(messageType)}
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
              menuOptions={getMenuOptions(messageType)}
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
              menuOptions={getMenuOptions(messageType)}
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
              menuOptions={getMenuOptions(messageType)}
            />
          );
        default:
          return null;
      }
    } else if (item?.attachments?.length >= 1 || isReplyMessage) {
      return (
        <ComposedCell
          messageData={item}
          channel={channel}
          menuOptions={getMenuOptions(messageType)}
        />
      );
    } else if ('content' in item && item.content) {
      // Check if 'content' exists in 'item' (i.e., it's a message item)
      return (
        <TextMessageCell
          {...{ item, index }}
          channel={channel}
          menuOptions={getMenuOptions(messageType)}
        />
      );
    } else {
      return <View />;
    }
  }
};
