import React from 'react';
import { Message } from '@/types';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { selectConversationById } from '@/store/conversation/conversationSelectors';
import { useChatWindowContext } from '@/context';
// import { setQuoteMessage } from '@/store/conversation/sendMessageSlice';
import { conversationActions } from '@/store/conversation/conversationActions';
import { unixTimestampToReadableTime, useHaptic } from '@/utils';
// import { inboxHasFeature, is360DialogWhatsAppChannel, useHaptic } from '@/utils';
// import { INBOX_FEATURES } from '@/constants';
import { ComposedBubble, DeliveryStatus, TextBubble } from '../message-components';
import { showToast } from '@/helpers/ToastHelper';
import {
  ATTACHMENT_TYPES,
  MESSAGE_STATUS,
  MESSAGE_VARIANTS,
  ORIENTATION,
  SENDER_TYPES,
  TEXT_MAX_WIDTH,
} from '@/constants';
import { LocationCell } from '../message-components/LocationCell';
import { CONTENT_TYPES } from '@/constants';
import i18n from '@/i18n';
import Clipboard from '@react-native-clipboard/clipboard';
import { MESSAGE_TYPES } from '@/constants';
import { CopyIcon, Trash } from '@/svg-icons';
import { MenuOption, MessageMenu } from '../message-menu';

import {
  AudioCell,
  ComposedCell,
  EmailMessageCell,
  FileCell,
  ImageCell,
  VideoCell,
  ActivityBubble,
} from '../message-components';

import { tailwind } from '@/theme';
import { View } from 'react-native';
import { Avatar } from '@/components-next';

type MessageComponentProps = {
  item: Message;
  index: number;
  isEmailInbox: boolean;
  currentUserId: number;
};

const variantTextMap = {
  [MESSAGE_VARIANTS.AGENT]: 'text-gray-700',
  [MESSAGE_VARIANTS.USER]: 'text-white',
  [MESSAGE_VARIANTS.BOT]: 'text-gray-700',
  [MESSAGE_VARIANTS.TEMPLATE]: 'text-gray-700',
  [MESSAGE_VARIANTS.ERROR]: 'text-white',
};

const variantBaseMap = {
  [MESSAGE_VARIANTS.AGENT]: 'bg-gray-100',
  [MESSAGE_VARIANTS.PRIVATE]: 'bg-amber-100',
  // [MESSAGE_VARIANTS.PRIVATE]:
  //   'bg-n-solid-amber text-n-amber-12 [&_.prosemirror-mention-node]:font-semibold',
  [MESSAGE_VARIANTS.USER]: 'bg-blue-700',
  // [MESSAGE_VARIANTS.ACTIVITY]: 'bg-n-alpha-1 text-n-slate-11 text-sm',
  [MESSAGE_VARIANTS.BOT]: 'bg-blue-100',
  [MESSAGE_VARIANTS.TEMPLATE]: 'bg-blue-100',
  [MESSAGE_VARIANTS.ERROR]: 'bg-ruby-700',
  // [MESSAGE_VARIANTS.EMAIL]: 'bg-n-gray-3 w-full',
  // [MESSAGE_VARIANTS.UNSUPPORTED]:
  // 'bg-n-solid-amber/70 border border-dashed border-n-amber-12 text-n-amber-12',
};

export const MessageComponent = (props: MessageComponentProps) => {
  const dispatch = useAppDispatch();
  const { conversationId } = useChatWindowContext();

  const { item, currentUserId, isEmailInbox } = props;
  const {
    messageType,
    contentType,
    status,
    contentAttributes,
    sender,
    groupWithNext,
    groupWithPrevious,
    senderId,

    senderType,
  } = item;

  const hapticSelection = useHaptic();
  const conversation = useAppSelector(state => selectConversationById(state, conversationId));
  const channel = conversation?.channel || conversation?.meta?.channel;

  const variant = () => {
    if ('date' in item) return MESSAGE_VARIANTS.DATE;

    if (item.private) return MESSAGE_VARIANTS.PRIVATE;

    if (isEmailInbox) {
      const emailInboxTypes = [MESSAGE_TYPES.INCOMING, MESSAGE_TYPES.OUTGOING];
      if (emailInboxTypes.includes(messageType)) {
        return MESSAGE_VARIANTS.EMAIL;
      }
    }

    if (contentType === CONTENT_TYPES.INCOMING_EMAIL) {
      return MESSAGE_VARIANTS.EMAIL;
    }

    if (status === MESSAGE_STATUS.FAILED) return MESSAGE_VARIANTS.ERROR;
    if (contentAttributes?.isUnsupported) return MESSAGE_VARIANTS.UNSUPPORTED;

    const isBot = !sender || sender.type === SENDER_TYPES.AGENT_BOT;
    if (isBot && messageType === MESSAGE_TYPES.OUTGOING) {
      return MESSAGE_VARIANTS.BOT;
    }

    const variants = {
      [MESSAGE_TYPES.INCOMING]: MESSAGE_VARIANTS.USER,
      [MESSAGE_TYPES.ACTIVITY]: MESSAGE_VARIANTS.ACTIVITY,
      [MESSAGE_TYPES.OUTGOING]: MESSAGE_VARIANTS.AGENT,
      [MESSAGE_TYPES.TEMPLATE]: MESSAGE_VARIANTS.TEMPLATE,
    };

    return variants[messageType] || MESSAGE_VARIANTS.USER;
  };

  // const handleQuoteReplyAttachment = () => {
  //   dispatch(setQuoteMessage(props.item as Message));
  // };

  const handleCopyMessage = (content: string) => {
    hapticSelection?.();
    if (content) {
      Clipboard.setString(content);
      showToast({ message: i18n.t('CONVERSATION.COPY_MESSAGE') });
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    await dispatch(conversationActions.deleteMessage({ conversationId, messageId }));
    showToast({ message: i18n.t('CONVERSATION.DELETE_MESSAGE_SUCCESS') });
  };

  // const inboxSupportsReplyTo = (channel: string) => {
  //   const incoming = inboxHasFeature(INBOX_FEATURES.REPLY_TO, channel);
  //   const outgoing =
  //     inboxHasFeature(INBOX_FEATURES.REPLY_TO_OUTGOING, channel) &&
  //     !is360DialogWhatsAppChannel(channel);

  //   return { incoming, outgoing };
  // };

  const getMenuOptions = (message: Message): MenuOption[] => {
    const { messageType, content, attachments } = message;
    // const { private: isPrivate } = message;
    const hasText = !!content;
    const hasAttachments = !!(attachments && attachments.length > 0);
    // const channel = conversation?.meta?.channel;

    const isDeleted = message.contentAttributes?.deleted;

    const menuOptions: MenuOption[] = [];
    if (messageType === MESSAGE_TYPES.ACTIVITY || isDeleted) {
      return [];
    }

    if (hasText) {
      menuOptions.push({
        title: i18n.t('CONVERSATION.LONG_PRESS_ACTIONS.COPY'),
        icon: <CopyIcon />,
        handleOnPressMenuOption: () => handleCopyMessage(content),
        destructive: false,
      });
    }

    // TODO: Add reply to message when we have the feature
    // if (!isPrivate && channel && inboxSupportsReplyTo(channel).outgoing) {
    //   menuOptions.push({
    //     title: i18n.t('CONVERSATION.LONG_PRESS_ACTIONS.REPLY'),
    //     icon: null,
    //     handleOnPressMenuOption: handleQuoteReplyAttachment,
    //     destructive: false,
    //   });
    // }

    if (hasAttachments || hasText) {
      menuOptions.push({
        title: i18n.t('CONVERSATION.LONG_PRESS_ACTIONS.DELETE_MESSAGE'),
        icon: <Trash />,
        handleOnPressMenuOption: () => handleDeleteMessage(message.id),
        destructive: true,
      });
    }

    return menuOptions;
  };

  const shouldShowAvatar = () => {
    if (messageType === MESSAGE_TYPES.ACTIVITY) return false;
    if (orientation() === ORIENTATION.RIGHT) return false;

    return true;
  };

  const flexOrientationClass = () => {
    const map = {
      [ORIENTATION.LEFT]: 'items-start',
      [ORIENTATION.RIGHT]: 'items-end',
      [ORIENTATION.CENTER]: 'items-center',
    };

    return map[orientation()];
  };

  const isMyMessage = () => {
    // if an outgoing message is still processing, then it's definitely a
    // message sent by the current user
    if (status === MESSAGE_STATUS.PROGRESS && messageType === MESSAGE_TYPES.OUTGOING) {
      return true;
    }

    const senderIdentifier = senderId ?? sender?.id;
    const senderTypeValue = senderType ?? sender?.type;

    if (!senderTypeValue || !senderIdentifier) {
      return false;
    }

    return (
      senderTypeValue.toLowerCase() === SENDER_TYPES.USER.toLowerCase() &&
      currentUserId === senderIdentifier
    );
  };

  const orientation = () => {
    if (isMyMessage()) {
      return ORIENTATION.RIGHT;
    }

    if (messageType === MESSAGE_TYPES.ACTIVITY) return ORIENTATION.CENTER;

    return ORIENTATION.LEFT;
  };

  const shouldGroupWithNext = () => {
    if (status === MESSAGE_STATUS.FAILED) return false;

    return groupWithNext;
  };

  const shouldGroupWithPrevious = () => {
    if (status === MESSAGE_STATUS.FAILED) return false;

    return groupWithPrevious;
  };

  const avatarInfo = () => {
    if (!sender || sender.type === SENDER_TYPES.AGENT_BOT) {
      return {
        name: 'Bot',
        src: require('../../../../assets/local/bot-avatar.png'),
      };
    }

    if (sender) {
      return {
        name: sender.name,
        src: {
          uri: sender.thumbnail,
        },
      };
    }

    return {
      name: '',
      src: '',
    };
  };

  const isReplyMessage = item.contentAttributes?.inReplyTo;

  const attachments = item.attachments;

  if (messageType === MESSAGE_TYPES.ACTIVITY) {
    return <ActivityBubble text={item.content} timeStamp={item.createdAt} />;
  }

  if (props.isEmailInbox && !item.private) {
    const emailInboxTypes = [MESSAGE_TYPES.INCOMING, MESSAGE_TYPES.OUTGOING];
    if (emailInboxTypes.includes(messageType))
      return <EmailMessageCell item={item} channel={channel} menuOptions={getMenuOptions(item)} />;
  }

  if (contentType === CONTENT_TYPES.INCOMING_EMAIL) {
    return <EmailMessageCell item={item} channel={channel} menuOptions={getMenuOptions(item)} />;
  }

  // TODO: Add unsupported message
  // if (contentAttributes?.isUnsupported) {
  //   return <UnsupportedBubble item={item} channel={channel} menuOptions={getMenuOptions(item)} />;
  // }

  // if (contentAttributes.type === 'dyte') {
  //   return DyteBubble;
  // }

  // if (contentAttributes.imageType === 'story_mention') {
  //   return InstagramStoryBubble;
  // }

  // // Message has only one attachment, no content and not a reply message
  // if (attachments?.length === 1 && !item.content && !isReplyMessage) {
  //   const commonProps = {
  //     sender: item.sender,
  //     timeStamp: item.createdAt,
  //     shouldRenderAvatar: !!item.shouldRenderAvatar,
  //     messageType: item.messageType,
  //     status: item.status,
  //     isPrivate: !!item.private,
  //     channel,
  //     sourceId: item.sourceId,
  //     menuOptions: getMenuOptions(item),
  //   };

  //   switch (attachments[0].fileType) {
  //     case ATTACHMENT_TYPES.IMAGE:
  //       return <ImageCell {...commonProps} imageSrc={attachments[0].dataUrl} />;
  //     case ATTACHMENT_TYPES.AUDIO:
  //       return <AudioCell {...commonProps} audioSrc={attachments[0].dataUrl} />;
  //     case ATTACHMENT_TYPES.VIDEO:
  //       return <VideoCell {...commonProps} videoSrc={attachments[0].dataUrl} />;
  //     case ATTACHMENT_TYPES.FILE:
  //       return <FileCell {...commonProps} fileSrc={attachments[0].dataUrl} />;
  //     case ATTACHMENT_TYPES.LOCATION:
  //       return (
  //         <LocationCell
  //           {...commonProps}
  //           latitude={attachments[0].coordinatesLat ?? 0}
  //           longitude={attachments[0].coordinatesLong ?? 0}
  //         />
  //       );
  //     default:
  //       return null;
  //   }
  // }

  if (attachments?.length >= 1 || isReplyMessage) {
    return (
      <Animated.View
        entering={FadeIn.duration(350)}
        style={[
          tailwind.style(
            'my-[1px]',
            flexOrientationClass(),
            shouldGroupWithPrevious() && orientation() === ORIENTATION.LEFT ? 'ml-7' : '',
            !shouldGroupWithPrevious && !shouldGroupWithNext ? 'mb-2' : 'mb-1',
            item.private ? 'my-2' : '',
          ),
        ]}>
        <Animated.View style={tailwind.style('flex flex-row')}>
          {!shouldGroupWithPrevious() && shouldShowAvatar() ? (
            <Animated.View style={tailwind.style('flex items-end justify-end mr-1')}>
              <Avatar size={'md'} src={avatarInfo().src} name={avatarInfo().name || ''} />
            </Animated.View>
          ) : null}
          <MessageMenu menuOptions={getMenuOptions(item)}>
            <Animated.View
              style={[
                tailwind.style(
                  'relative pl-3 pr-2.5 py-2 rounded-2xl overflow-hidden',
                  `max-w-[${TEXT_MAX_WIDTH}px]`,
                  variantBaseMap[variant()],
                  shouldGroupWithNext() && shouldGroupWithPrevious()
                    ? orientation() === ORIENTATION.LEFT
                      ? 'rounded-l-none'
                      : 'rounded-r-none'
                    : '',
                  shouldGroupWithNext() && !shouldGroupWithPrevious()
                    ? orientation() === ORIENTATION.LEFT
                      ? 'rounded-tl-none'
                      : 'rounded-tr-none'
                    : '',
                  !shouldGroupWithNext() && shouldGroupWithPrevious()
                    ? orientation() === ORIENTATION.LEFT
                      ? 'rounded-bl-none'
                      : 'rounded-br-none'
                    : '',
                ),
              ]}>
              <ComposedBubble item={item} variant={variant()} />
              {!shouldGroupWithPrevious() && (
                <Animated.View
                  style={tailwind.style(
                    'h-[21px] pt-[5px] pb-0.5 flex flex-row items-center justify-end',
                  )}>
                  <Animated.Text
                    style={tailwind.style(
                      'text-xs font-inter-420-20 tracking-[0.32px] pr-1',
                      variantTextMap[variant()],
                    )}>
                    {unixTimestampToReadableTime(item.createdAt)}
                  </Animated.Text>
                  <DeliveryStatus
                    isPrivate={item.private}
                    status={item.status}
                    messageType={item.messageType}
                    channel={channel}
                    sourceId={item.sourceId}
                    errorMessage={item.contentAttributes?.externalError || ''}
                    deliveredColor="text-gray-700"
                    sentColor="text-gray-700"
                  />
                </Animated.View>
              )}
            </Animated.View>
          </MessageMenu>
        </Animated.View>
      </Animated.View>
    );
  }

  if (item.content) {
    return (
      <Animated.View
        entering={FadeIn.duration(350)}
        style={[
          tailwind.style(
            'my-[1px]',
            flexOrientationClass(),
            shouldGroupWithPrevious() && orientation() === ORIENTATION.LEFT ? 'ml-7' : '',
            !shouldGroupWithPrevious && !shouldGroupWithNext ? 'mb-2' : 'mb-1',
            item.private ? 'my-2' : '',
          ),
        ]}>
        <Animated.View style={tailwind.style('flex flex-row')}>
          {!shouldGroupWithPrevious() && shouldShowAvatar() ? (
            <Animated.View style={tailwind.style('flex items-end justify-end mr-1')}>
              <Avatar size={'md'} src={avatarInfo().src} name={avatarInfo().name || ''} />
            </Animated.View>
          ) : null}
          <MessageMenu menuOptions={getMenuOptions(item)}>
            <Animated.View
              style={[
                tailwind.style(
                  'relative pl-3 pr-2.5 py-2 rounded-2xl overflow-hidden',
                  `max-w-[${TEXT_MAX_WIDTH}px]`,
                  variantBaseMap[variant()],
                  shouldGroupWithNext() && shouldGroupWithPrevious()
                    ? orientation() === ORIENTATION.LEFT
                      ? 'rounded-l-none'
                      : 'rounded-r-none'
                    : '',
                  shouldGroupWithNext() && !shouldGroupWithPrevious()
                    ? orientation() === ORIENTATION.LEFT
                      ? 'rounded-tl-none'
                      : 'rounded-tr-none'
                    : '',
                  !shouldGroupWithNext() && shouldGroupWithPrevious()
                    ? orientation() === ORIENTATION.LEFT
                      ? 'rounded-bl-none'
                      : 'rounded-br-none'
                    : '',
                ),
              ]}>
              <TextBubble
                {...{
                  item,
                  variant: variant(),
                }}
              />
              {!shouldGroupWithPrevious() && (
                <Animated.View
                  style={tailwind.style(
                    'h-[21px] pt-[5px] pb-0.5 flex flex-row items-center justify-end',
                  )}>
                  <Animated.Text
                    style={tailwind.style(
                      'text-xs font-inter-420-20 tracking-[0.32px] pr-1',
                      variantTextMap[variant()],
                    )}>
                    {unixTimestampToReadableTime(item.createdAt)}
                  </Animated.Text>
                  <DeliveryStatus
                    isPrivate={item.private}
                    status={item.status}
                    messageType={item.messageType}
                    channel={channel}
                    sourceId={item.sourceId}
                    errorMessage={item.contentAttributes?.externalError || ''}
                    deliveredColor="text-gray-700"
                    sentColor="text-gray-700"
                  />
                </Animated.View>
              )}
            </Animated.View>
          </MessageMenu>
        </Animated.View>
      </Animated.View>
    );
  }

  return <View />;
};
