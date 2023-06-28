/* eslint-disable react/prop-types */
import React, { useMemo } from 'react';
import { useTheme } from '@react-navigation/native';
import { View, Dimensions, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { Text } from 'components';
import { messageStamp } from '../../../helpers/TimeHelper';
import ChatMessageItem from './ChatMessageItem';
import { UserAvatar } from 'components';

import { INBOX_TYPES } from 'constants';

const createStyles = theme => {
  const { spacing, borderRadius, colors } = theme;
  return StyleSheet.create({
    message: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.micro,
    },
    emailContainer: {
      width: '100%',
    },
    activityView: {
      padding: spacing.smaller,
      borderRadius: borderRadius.small,
      maxWidth: Dimensions.get('window').width - 50,
      backgroundColor: colors.backgroundActivity,
      borderWidth: 1,
      borderColor: colors.border,
    },
    activityDateView: {
      alignItems: 'flex-end',
    },
    messageActivity: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    messageBubble: {
      flexDirection: 'row',
      alignItems: 'flex-end',
    },
    outgoingMessageThumbnail: {
      marginLeft: spacing.smaller,
    },
    incomingMessageThumbnail: {
      marginRight: spacing.smaller,
    },
  });
};

const MessageContentComponent = ({ conversation, message, type, showAttachment, created_at }) => {
  return (
    <View>
      <ChatMessageItem
        conversation={conversation}
        message={message}
        type={type}
        created_at={created_at}
        showAttachment={showAttachment}
      />
    </View>
  );
};

const MessageContent = MessageContentComponent;

const ActivityMessageComponent = ({ message, created_at }) => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.activityView}>
      <View style={styles.messageActivity}>
        <Text sm color={colors.textDarker}>
          {message.content}
        </Text>
      </View>
      <View style={styles.activityDateView}>
        <Text xxs color={colors.text} style={styles.date}>
          {messageStamp({ time: created_at })}
        </Text>
      </View>
    </View>
  );
};

const ActivityMessage = ActivityMessageComponent;

const propTypes = {
  message: PropTypes.shape({
    content: PropTypes.string,
    date: PropTypes.string,
  }),
  showAttachment: PropTypes.func,
  conversation: PropTypes.object,
};

const defaultProps = {
  message: { content: null, date: null },
};

const ChatMessageComponent = ({ message, showAttachment, conversation }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { message_type, created_at } = message;
  const channel = conversation?.meta?.channel;

  const isPrivate = message?.private;

  const isEmailChannel = channel === INBOX_TYPES.EMAIL;

  const shouldShowFullWidth = isEmailChannel && message_type !== 2 && !isPrivate;

  const isTwitterChannel = channel === INBOX_TYPES.TWITTER;

  const senderName = message?.sender?.name || 'Bot';
  const senderThumbnail = message?.sender?.thumbnail || '';

  let alignment = message_type ? 'flex-end' : 'flex-start';
  if (message_type === 2) {
    alignment = 'center';
  }

  return (
    <View style={[styles.message, !shouldShowFullWidth ? { justifyContent: alignment } : null]}>
      <View style={[shouldShowFullWidth ? styles.emailContainer : {}]}>
        {alignment === 'flex-start' ? (
          <View style={styles.messageBubble}>
            <MessageContent
              conversation={conversation}
              message={message}
              created_at={created_at}
              type="incoming"
              showAttachment={showAttachment}
            />
          </View>
        ) : alignment === 'center' ? (
          <ActivityMessage message={message} created_at={created_at} type="activity" />
        ) : (
          <View style={styles.messageBubble}>
            <MessageContent
              conversation={conversation}
              message={message}
              created_at={created_at}
              type="outgoing"
              showAttachment={showAttachment}
            />
            {!isTwitterChannel ? (
              <View style={styles.outgoingMessageThumbnail}>
                <UserAvatar
                  thumbnail={senderThumbnail}
                  userName={senderName}
                  size={16}
                  fontSize={8}
                />
              </View>
            ) : null}
          </View>
        )}
      </View>
    </View>
  );
};

ChatMessageComponent.defaultProps = defaultProps;
ChatMessageComponent.propTypes = propTypes;

export default ChatMessageComponent;
