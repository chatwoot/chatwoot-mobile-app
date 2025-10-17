import React from 'react';
import { Channel, Message } from '@/types';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { selectConversationById } from '@/store/conversation/conversationSelectors';
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
import { CopyIcon, Trash } from '@/svg-icons';
import { MenuOption, MessageMenu } from '../message-menu';
import { tailwind } from '@/theme';
import { Dimensions, View } from 'react-native';
import { Avatar } from '@/components-next';

// import { ImageMetadata } from '@/types';

type MessageComponentProps = {
  item: Message;
  index: number;
  isEmailInbox: boolean;
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
  [MESSAGE_VARIANTS.USER]: 'bg-brand-600',
  [MESSAGE_VARIANTS.BOT]: 'bg-brand-100',
  [MESSAGE_VARIANTS.TEMPLATE]: 'bg-brand-100',
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
}: MessageWrapperProps) => {
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

  return (
    <Animated.View
      entering={FadeIn.duration(350)}
      style={[
        tailwind.style(
          'my-[1px]',
          flexOrientationClass(),
          shouldGroupWithPrevious && orientation === ORIENTATION.LEFT ? 'ml-7' : '',
          shouldGroupWithPrevious && orientation === ORIENTATION.RIGHT ? 'pr-7' : '',
          !shouldGroupWithPrevious && !shouldGroupWithNext ? 'mb-2' : 'mb-1',
          item.private ? 'my-1' : '',
        ),
      ]}>
      <Animated.View style={tailwind.style('flex flex-row')}>
        {!shouldGroupWithPrevious && shouldShowAvatar && orientation === ORIENTATION.LEFT ? (
          <Animated.View style={tailwind.style('flex items-end justify-end mr-1')}>
            <Avatar size={'md'} src={avatarInfo.src} name={avatarInfo.name || ''} />
          </Animated.View>
        ) : null}
        <MessageMenu menuOptions={getMenuOptions(item)}>
          <Animated.View
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
            ]}>
            {children}
            {!shouldGroupWithPrevious && (
              <Animated.View
                style={tailwind.style(
                  'h-[21px] pt-[5px] pb-0.5 flex flex-row items-center justify-end',
                )}>
                <Animated.Text
                  style={tailwind.style(
                    'text-xs font-inter-420-20 tracking-[0.32px] pr-1',
                    variantTextMap[variant],
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
        {!shouldGroupWithPrevious && shouldShowAvatar && orientation === ORIENTATION.RIGHT ? (
          <Animated.View style={tailwind.style('flex items-end justify-end ml-1')}>
            <Avatar size={'md'} src={avatarInfo.src} name={avatarInfo.name || ''} />
          </Animated.View>
        ) : null}
      </Animated.View>
    </Animated.View>
  );
};

export const MessageComponent = (props: MessageComponentProps) => {
  const dispatch = useAppDispatch();
  const { conversationId } = useChatWindowContext();
  const { item, isEmailInbox } = props;
  const { messageType, contentType, status, sender, groupWithNext, groupWithPrevious } = item;

  const hapticSelection = useHaptic();
  const conversation = useAppSelector(state => selectConversationById(state, conversationId));
  const channel = conversation?.channel || conversation?.meta?.channel;

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

  const getMenuOptions = (message: Message): MenuOption[] => {
    const { messageType, content, attachments } = message;
    const hasText = !!content;
    const hasAttachments = !!(attachments && attachments.length > 0);
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
    return true;
  };

  const orientation = () => {
    if (messageType === MESSAGE_TYPES.ACTIVITY) return ORIENTATION.CENTER;
    if (messageType === MESSAGE_TYPES.INCOMING) return ORIENTATION.LEFT;
    // All non-incoming (outgoing, template, bot, other agents) on the right
    return ORIENTATION.RIGHT;
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
<<<<<<< HEAD
        src: { uri: '' },
=======
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        src: require('../../../../assets/local/bot-avatar.png'),
>>>>>>> upstream/develop
      };
    }

    return {
      name: sender?.name || '',
      src: {
        uri: sender?.thumbnail || null,
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
      messageContent = <EmailBubble item={item} variant={variant()} />;
    } else if (isEmailInbox && !item.private) {
      messageContent = <EmailBubble item={item} variant={variant()} />;
    }
    // TODO: Add this once we have a proper way to render single attachments
    // else if (attachments?.length === 1 && !item.content && !isReplyMessage) {
    //   messageContent = renderSingleAttachment(attachments[0]);
    // }
    else if (attachments?.length >= 1 || isReplyMessage) {
      messageContent = <ComposedBubble item={item} variant={variant()} />;
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
        channel={channel}>
        {messageContent}
      </MessageWrapper>
    );
  };

  return renderMessageContent();
};
