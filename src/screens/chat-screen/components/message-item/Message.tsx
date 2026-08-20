import React from 'react';
import { Channel, Message } from '@/types';
import Animated from 'react-native-reanimated';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { selectConversationById } from '@/store/conversation/conversationSelectors';
import { selectInboxById } from '@/store/inbox/inboxSelectors';
import { useChatWindowContext } from '@/context';
import { conversationActions } from '@/store/conversation/conversationActions';
import { unixTimestampToReadableTime, useHaptic } from '@/utils';
import {
  ComposedBubble,
  DeliveryStatus,
  TextBubble,
  ActivityBubble,
  // LocationBubble,
  // ImageBubble,
  // AudioBubble,
  // VideoBubble,
  // FileBubble,
  EmailBubble,
  UnsupportedBubble,
  MessageError,
} from '../message-components';
import { showToast } from '@/utils/toastUtils';
import {
  // ATTACHMENT_TYPES,
  MESSAGE_STATUS,
  MESSAGE_VARIANTS,
  ORIENTATION,
  SENDER_TYPES,
  TEXT_MAX_WIDTH,
  CONTENT_TYPES,
  MESSAGE_TYPES,
} from '@/constants';
import i18n from '@/i18n';
import Clipboard from '@react-native-clipboard/clipboard';
import { CopyIcon, Trash, ReplyIcon, TranslateIcon} from '@/svg-icons';
import { setQuoteMessage } from '@/store/conversation/sendMessageSlice';
import { inboxSupportsReplyTo, isAWhatsAppChannel } from '@/utils';
import { MenuOption, MessageMenu } from '../message-menu';
import { tailwind } from '@/theme';
import { Dimensions, View, Text } from 'react-native';
import { Avatar } from '@/components-next';
import { useTargetMessageAnimation } from './useTargetMessageAnimation';
import { useMessageEntrance } from './useMessageEntrance';

// import { ImageMetadata } from '@/types';

const BOT_SENDER_TYPES: string[] = [SENDER_TYPES.AGENT_BOT, SENDER_TYPES.CAPTAIN_ASSISTANT];

const isBotSender = (senderType?: string) => !!senderType && BOT_SENDER_TYPES.includes(senderType);

// Captain assistants are serialized with `avatarUrl`, the other sender types with `thumbnail`.
const senderAvatarSource = (sender: Message['sender']) => {
  if (!sender) {
    return null;
  }
  const avatarUrl = 'avatarUrl' in sender ? sender.avatarUrl : null;
  const thumbnail = 'thumbnail' in sender ? sender.thumbnail : null;
  return avatarUrl || thumbnail || null;
};

type MessageComponentProps = {
  item: Message;
  index: number;
  isEmailInbox: boolean;
  currentUserId: number;
  isTargetMessage?: boolean;
};

type MessageWrapperProps = {
  children: React.ReactNode;
  item: Message;
  orientation: string;
  shouldGroupWithPrevious: boolean;
  shouldGroupWithNext: boolean;
  shouldShowAvatar: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  avatarInfo: { name: string | null | undefined; src: any }; // Updated type
  getMenuOptions: (message: Message) => MenuOption[];
  variant: string;
  channel?: Channel;
  isTargetMessage?: boolean;
  onRetry: () => void;
  canSendPublicReply: boolean;
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
  [MESSAGE_VARIANTS.USER]: 'bg-blue-700',
  [MESSAGE_VARIANTS.BOT]: 'bg-blue-100',
  [MESSAGE_VARIANTS.TEMPLATE]: 'bg-blue-100',
  [MESSAGE_VARIANTS.ERROR]: 'bg-ruby-700',
  [MESSAGE_VARIANTS.EMAIL]: 'bg-gray-100',
  [MESSAGE_VARIANTS.UNSUPPORTED]: 'bg-amber-100 border border-dashed border-amber-700',
};

const variantBorderMap = {
  [MESSAGE_VARIANTS.AGENT]: 'border-gray-100',
  [MESSAGE_VARIANTS.USER]: 'border-gray-100',
  [MESSAGE_VARIANTS.BOT]: 'border-gray-100',
  [MESSAGE_VARIANTS.TEMPLATE]: 'border-gray-100',
  [MESSAGE_VARIANTS.ERROR]: 'border-gray-100',
  [MESSAGE_VARIANTS.EMAIL]: 'border-gray-100',
  [MESSAGE_VARIANTS.UNSUPPORTED]: 'border-gray-100',
};

const MessageWrapper = ({
  children,
  item,
  orientation,
  shouldGroupWithPrevious,
  shouldGroupWithNext,
  shouldShowAvatar,
  avatarInfo,
  getMenuOptions,
  variant,
  channel,
  isTargetMessage = false,
  onRetry,
  canSendPublicReply,
}: MessageWrapperProps) => {
  const { zoomStyle, highlightStyle } = useTargetMessageAnimation({
    isTargetMessage,
  });
  const entering = useMessageEntrance(item.id);

  const flexOrientationClass = () => {
    const map = {
      [ORIENTATION.LEFT]: 'items-start',
      [ORIENTATION.RIGHT]: 'items-end',
      [ORIENTATION.CENTER]: 'items-center',
    };
    return map[orientation];
  };

  const windowWidth = Dimensions.get('window').width;
  // 52 is the sum of the left and right padding (12 + 12) and avatar width (24) and gap between avatar and message (4)
  const EMAIL_WIDTH = windowWidth - 52;

  // Only the search-target row animates, so only it needs an Animated.View.
  const Bubble = isTargetMessage ? Animated.View : View;

  return (
    <Animated.View
      entering={entering}
      style={tailwind.style(
        'my-[1px]',
        flexOrientationClass(),
        shouldGroupWithPrevious && orientation === ORIENTATION.LEFT ? 'ml-7' : '',
        !shouldGroupWithPrevious && !shouldGroupWithNext ? 'mb-2' : 'mb-1',
        item.private ? 'my-1' : '',
      )}>
      <View style={tailwind.style('flex flex-row')}>
        {!shouldGroupWithPrevious && shouldShowAvatar ? (
          <View style={tailwind.style('flex items-end justify-end mr-1')}>
            <Avatar size={'md'} src={avatarInfo.src} name={avatarInfo.name || ''} />
          </View>
        ) : null}
        <MessageMenu menuOptions={getMenuOptions(item)}>
          <Bubble
            style={[
              tailwind.style(
                'relative pl-3 pr-2.5 py-2 rounded-2xl overflow-hidden',
                `${variant === MESSAGE_VARIANTS.EMAIL ? `max-w-[${EMAIL_WIDTH}px]` : `max-w-[${TEXT_MAX_WIDTH}px]`}`,
                variantBaseMap[variant],
                variantBorderMap[variant],
                shouldGroupWithNext && shouldGroupWithPrevious
                  ? orientation === ORIENTATION.LEFT
                    ? 'rounded-l-none'
                    : 'rounded-r-none'
                  : '',
                shouldGroupWithNext && !shouldGroupWithPrevious
                  ? orientation === ORIENTATION.LEFT
                    ? 'rounded-tl-none'
                    : 'rounded-tr-none'
                  : '',
                !shouldGroupWithNext && shouldGroupWithPrevious
                  ? orientation === ORIENTATION.LEFT
                    ? 'rounded-bl-none'
                    : 'rounded-br-none'
                  : '',
              ),
              isTargetMessage && zoomStyle,
            ]}>
            {children}
            {/* Highlight overlay for target message */}
            {isTargetMessage && (
              <Animated.View
                style={[tailwind.style('absolute inset-0 bg-white rounded-2xl'), highlightStyle]}
                pointerEvents="none"
              />
            )}
            {!shouldGroupWithPrevious && (
              <View
                style={tailwind.style(
                  'h-[21px] pt-[5px] pb-0.5 flex flex-row items-center justify-end',
                )}>
                <Text
                  style={tailwind.style(
                    'text-xs font-inter-420-20 tracking-[0.32px] pr-1',
                    variantTextMap[variant],
                  )}>
                  {unixTimestampToReadableTime(item.createdAt)}
                </Text>
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
              </View>
            )}
          </Bubble>
        </MessageMenu>
      </View>
      {item.status === MESSAGE_STATUS.FAILED ? (
        <MessageError
          message={item}
          orientation={orientation}
          onRetry={onRetry}
          canSendPublicReply={canSendPublicReply}
        />
      ) : null}
    </Animated.View>
  );
};

export const MessageComponent = (props: MessageComponentProps) => {
  const dispatch = useAppDispatch();
  const { conversationId } = useChatWindowContext();
  const { item, currentUserId, isEmailInbox, isTargetMessage = false } = props;
  const {
    messageType,
    contentType,
    status,
    sender,
    groupWithNext,
    groupWithPrevious,
    senderId,
    senderType,
  } = item;

  const hapticSelection = useHaptic();
  const conversation = useAppSelector(state => selectConversationById(state, conversationId));
  const channel = conversation?.channel || conversation?.meta?.channel;
  const { inboxId } = conversation || {};
  const inbox = useAppSelector(state => (inboxId ? selectInboxById(state, inboxId) : undefined));

  const variant = () => {
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
    if (item.contentAttributes?.isUnsupported) return MESSAGE_VARIANTS.UNSUPPORTED;

    const isBot = !sender || isBotSender(sender.type);
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

  const handleQuoteReply = (message: Message) => {
    dispatch(setQuoteMessage(message));
  }

  // Mirrors the condition the reply box uses to decide between reply and note mode, so the retry
  // button is offered exactly where a public reply could still be composed.
  const canSendPublicReply = !!conversation?.canReply || isAWhatsAppChannel(inbox);

  const handleRetryMessage = async () => {
    hapticSelection?.();
    try {
      await dispatch(conversationActions.retryMessage(item)).unwrap();
    } catch {
      showToast({ message: i18n.t('CONVERSATION.RETRY_MESSAGE_ERROR') });
    }
  };

  const handleTranslateMessage = async (messageId: number) => {
    hapticSelection?.();
    const targetLanguage = i18n.locale?.split('_')[0] || 'en';
    try {
      await dispatch(
        conversationActions.translateMessage({ conversationId, messageId, targetLanguage }),
      ).unwrap();
      showToast({ message: i18n.t('CONVERSATION.TRANSLATE_SUCCESS') });
    } catch {
      showToast({ message: i18n.t('CONVERSATION.TRANSLATE_ERROR') });
    }
  };

  const getMenuOptions = (message: Message): MenuOption[] => {
    const { messageType, content, attachments, private: isPrivate, status: messageStatus } = message;
    const hasText = !!content;
    const hasAttachments = !!(attachments && attachments.length > 0);
    const isDeleted = message.contentAttributes?.deleted;
    const isFailedOrProcessing =
      messageStatus === MESSAGE_STATUS.FAILED || messageStatus === MESSAGE_STATUS.PROGRESS;

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

      const targetLanguage = i18n.locale?.split('_')[0] || 'en';
      const hasTranslationForLocale = !!message.contentAttributes?.translations?.[targetLanguage];
      if (!hasTranslationForLocale) {
        menuOptions.push({
          title: i18n.t('CONVERSATION.LONG_PRESS_ACTIONS.TRANSLATE'),
          icon: <TranslateIcon />,
          handleOnPressMenuOption: () => handleTranslateMessage(message.id),
          destructive: false,
        });
      }
    }

    if (!isPrivate && !isFailedOrProcessing && inboxSupportsReplyTo(inbox).outgoing) {
      menuOptions.push({
        title: i18n.t('CONVERSATION.LONG_PRESS_ACTIONS.REPLY'),
        icon: <ReplyIcon />,
        handleOnPressMenuOption: () => handleQuoteReply(message),
        destructive: false,
      });
    }

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

  const isMyMessage = () => {
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
    return groupWithNext ?? false;
  };

  const shouldGroupWithPrevious = () => {
    if (status === MESSAGE_STATUS.FAILED) return false;
    return groupWithPrevious ?? false;
  };

  const avatarInfo = () => {
    if (!sender || sender.type === SENDER_TYPES.AGENT_BOT) {
      return {
        name: i18n.t('CONVERSATION.BOT'),
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        src: require('../../../../assets/local/bot-avatar.png'),
      };
    }

    return {
      name: sender?.name || '',
      src: {
        uri: senderAvatarSource(sender),
      },
    };
  };
  // TODO: Add this once we have a proper way to render single attachments
  // const renderSingleAttachment = (attachment: ImageMetadata) => {
  //   switch (attachment.fileType) {
  //     case ATTACHMENT_TYPES.LOCATION:
  //       return (
  //         <LocationBubble
  //           latitude={attachment.coordinatesLat ?? 0}
  //           longitude={attachment.coordinatesLong ?? 0}
  //           variant={variant()}
  //         />
  //       );
  //     case ATTACHMENT_TYPES.IMAGE:
  //       return <ImageBubble imageSrc={attachment.dataUrl} />;
  //     case ATTACHMENT_TYPES.AUDIO:
  //       return <AudioBubble audioSrc={attachment.dataUrl} variant={variant()} />;
  //     case ATTACHMENT_TYPES.VIDEO:
  //       return <VideoBubble videoSrc={attachment.dataUrl} />;
  //     case ATTACHMENT_TYPES.FILE:
  //       return <FileBubble fileSrc={attachment.dataUrl} variant={variant()} />;
  //     default:
  //       return <TextBubble item={item} variant={variant()} />;
  //   }
  // };

  const renderMessageContent = () => {
    if (messageType === MESSAGE_TYPES.ACTIVITY) {
      return <ActivityBubble text={item.content} timeStamp={item.createdAt} />;
    }

    const attachments = item.attachments;
    const isReplyMessage = item.contentAttributes?.inReplyTo;
    const isUnsupported = item.contentAttributes?.isUnsupported;
    let messageContent;

    if (isUnsupported) {
      messageContent = <UnsupportedBubble />;
    } else if (contentType === CONTENT_TYPES.INCOMING_EMAIL) {
      messageContent = <EmailBubble item={item} variant={variant()} orientation={orientation()} />;
    } else if (isEmailInbox && !item.private) {
      messageContent = <EmailBubble item={item} variant={variant()} orientation={orientation()} />;
    }
    // TODO: Add this once we have a proper way to render single attachments
    // else if (attachments?.length === 1 && !item.content && !isReplyMessage) {
    //   messageContent = renderSingleAttachment(attachments[0]);
    // }
    else if (attachments?.length >= 1 || isReplyMessage) {
      messageContent = (
        <ComposedBubble item={item} variant={variant()} orientation={orientation()} />
      );
    } else if (item.content) {
      messageContent = <TextBubble item={item} variant={variant()} />;
    } else {
      return <View />;
    }

    return (
      <MessageWrapper
        item={item}
        orientation={orientation()}
        shouldGroupWithPrevious={shouldGroupWithPrevious()}
        shouldGroupWithNext={shouldGroupWithNext()}
        shouldShowAvatar={shouldShowAvatar()}
        avatarInfo={avatarInfo()}
        getMenuOptions={getMenuOptions}
        variant={variant()}
        channel={channel}
        isTargetMessage={isTargetMessage}
        onRetry={handleRetryMessage}
        canSendPublicReply={canSendPublicReply}>
        {messageContent}
      </MessageWrapper>
    );
  };

  return renderMessageContent();
};
