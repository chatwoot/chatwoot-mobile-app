import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Message } from '@/types';
import { tailwind } from '@/theme';
import { useTheme } from '@/context/ThemeContext';
import { MESSAGE_VARIANTS, MESSAGE_TYPES, SENDER_TYPES, MESSAGE_STATUS, ORIENTATION } from '@/constants';
import { unixTimestampToReadableTime } from '@/utils';
import { Avatar } from '@/components-next';

// Import bubble components
import { TextBubble } from '../message-components/TextBubble';
import { ActivityBubble } from '../message-components/ActivityBubble';
import { EmailBubble } from '../message-components/EmailBubble';
import { ComposedBubble } from '../message-components/ComposedBubble';
import { UnsupportedBubble } from '../message-components/UnsupportedBubble';
import { CONTENT_TYPES } from '@/constants';
import { DeliveryStatus } from '../message-components';

interface OptimizedMessageItemProps {
  message: Message;
  currentUserId: number;
  isEmailInbox: boolean;
  channel?: string;
}

/**
 * Optimized Message Item Component - WhatsApp Standard
 * 
 * Features:
 * - Fully memoized with custom comparison
 * - Crash-proof with null safety
 * - Efficient re-rendering
 * - WhatsApp-style bubbles
 */
const OptimizedMessageItem: React.FC<OptimizedMessageItemProps> = memo(
  ({ message, currentUserId, isEmailInbox, channel }) => {
    const { colors, isDark } = useTheme();

    // Null safety check
    if (!message || !message.id) {
      return <View style={{ height: 0 }} />;
    }

    const {
      messageType,
      contentType,
      status,
      sender,
      senderId,
      senderType,
      groupWithNext,
      groupWithPrevious,
      content,
      attachments,
      contentAttributes,
      createdAt,
    } = message;

    // Determine if this is the current user's message
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

    // Determine message variant
    const getVariant = (): string => {
      if (message.private) return MESSAGE_VARIANTS.PRIVATE;
      
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

      const variants: Record<string, string> = {
        [MESSAGE_TYPES.INCOMING]: MESSAGE_VARIANTS.USER,
        [MESSAGE_TYPES.ACTIVITY]: MESSAGE_VARIANTS.ACTIVITY,
        [MESSAGE_TYPES.OUTGOING]: MESSAGE_VARIANTS.AGENT,
        [MESSAGE_TYPES.TEMPLATE]: MESSAGE_VARIANTS.TEMPLATE,
      };

      return variants[messageType] || MESSAGE_VARIANTS.USER;
    };

    const variant = getVariant();

    // Determine orientation
    const getOrientation = (): string => {
      if (isMyMessage()) return ORIENTATION.RIGHT;
      if (messageType === MESSAGE_TYPES.ACTIVITY) return ORIENTATION.CENTER;
      return ORIENTATION.LEFT;
    };

    const orientation = getOrientation();

    // Should show avatar
    const shouldShowAvatar = (): boolean => {
      if (messageType === MESSAGE_TYPES.ACTIVITY) return false;
      if (orientation === ORIENTATION.RIGHT) return false;
      return true;
    };

    // Get avatar info
    const getAvatarInfo = () => {
      if (!sender || sender.type === SENDER_TYPES.AGENT_BOT) {
        return {
          name: 'Bot',
          src: require('../../../../../assets/local/bot-avatar.png'),
        };
      }

      return {
        name: sender?.name || '',
        src: {
          uri: sender?.thumbnail || null,
        },
      };
    };

    const avatarInfo = getAvatarInfo();
    const shouldGroupWithNext = groupWithNext ?? false;
    const shouldGroupWithPrevious = groupWithPrevious ?? false;
    const showAvatar = shouldShowAvatar() && !shouldGroupWithPrevious;

    // Activity messages are centered
    if (messageType === MESSAGE_TYPES.ACTIVITY) {
      return (
        <Animated.View entering={FadeIn.duration(200)} style={styles.centerContainer}>
          <ActivityBubble text={content} timeStamp={createdAt} />
        </Animated.View>
      );
    }

    // Render message content bubble
    const renderBubbleContent = () => {
      const isReplyMessage = contentAttributes?.inReplyTo;
      const isUnsupported = contentAttributes?.isUnsupported;

      if (isUnsupported) {
        return <UnsupportedBubble />;
      }

      if (contentType === CONTENT_TYPES.INCOMING_EMAIL || (isEmailInbox && !message.private)) {
        return <EmailBubble item={message} variant={variant} />;
      }

      if (attachments?.length >= 1 || isReplyMessage) {
        return <ComposedBubble item={message} variant={variant} />;
      }

      if (content) {
        return <TextBubble item={message} variant={variant} />;
      }

      return null;
    };

    const bubbleContent = renderBubbleContent();

    if (!bubbleContent) {
      return <View style={{ height: 0 }} />;
    }

    // Container alignment
    const containerStyle = [
      styles.messageContainer,
      orientation === ORIENTATION.RIGHT ? styles.rightAlign : styles.leftAlign,
      shouldGroupWithPrevious && orientation === ORIENTATION.LEFT ? styles.groupedLeft : {},
      !shouldGroupWithPrevious && !shouldGroupWithNext ? styles.marginBottom : {},
    ];

    return (
      <Animated.View entering={FadeIn.duration(200)} style={containerStyle}>
        <View style={[styles.row, orientation === ORIENTATION.RIGHT ? styles.rowReverse : {}]}>
          {/* Avatar for received messages */}
          {showAvatar && (
            <View style={styles.avatarContainer}>
              <Avatar size="md" src={avatarInfo.src} name={avatarInfo.name} />
            </View>
          )}

          {/* Message Bubble */}
          <View style={styles.bubbleWrapper}>
            {bubbleContent}
            
            {/* Timestamp and Status */}
            {!shouldGroupWithPrevious && createdAt && (
              <View style={styles.footer}>
                <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
                  {unixTimestampToReadableTime(createdAt)}
                </Text>
                <DeliveryStatus
                  isPrivate={message.private}
                  status={message.status}
                  messageType={message.messageType}
                  channel={channel}
                  sourceId={message.sourceId}
                  errorMessage={contentAttributes?.externalError || ''}
                  deliveredColor="text-gray-700"
                  sentColor="text-gray-700"
                />
              </View>
            )}
          </View>
        </View>
      </Animated.View>
    );
  },
  // Custom comparison for optimization - only re-render if essential props change
  (prevProps, nextProps) => {
    return (
      prevProps.message.id === nextProps.message.id &&
      prevProps.message.status === nextProps.message.status &&
      prevProps.message.content === nextProps.message.content &&
      prevProps.currentUserId === nextProps.currentUserId
    );
  }
);

OptimizedMessageItem.displayName = 'OptimizedMessageItem';

const styles = StyleSheet.create({
  messageContainer: {
    marginVertical: 1,
    paddingHorizontal: 12,
  },
  centerContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  leftAlign: {
    alignItems: 'flex-start',
  },
  rightAlign: {
    alignItems: 'flex-end',
  },
  groupedLeft: {
    marginLeft: 28,
  },
  marginBottom: {
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    maxWidth: '100%',
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  avatarContainer: {
    marginRight: 8,
    marginTop: 4,
  },
  bubbleWrapper: {
    maxWidth: '75%',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 2,
    paddingHorizontal: 4,
  },
  timestamp: {
    fontSize: 11,
    marginRight: 4,
  },
});

export default OptimizedMessageItem;
