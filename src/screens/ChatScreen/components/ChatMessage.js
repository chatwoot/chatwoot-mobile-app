/* eslint-disable react/prop-types */
import React from 'react';
import { View, Dimensions } from 'react-native';
import PropTypes from 'prop-types';
import { withStyles } from '@ui-kitten/components';

import CustomText from '../../../components/Text';
import { messageStamp } from '../../../helpers/TimeHelper';
import ChatMessageItem from './ChatMessageItem';
import { UserAvatar } from 'components';

import { INBOX_TYPES } from 'constants';

const styles = theme => ({
  message: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  emailContainer: {
    width: '100%',
  },

  activityView: {
    padding: 8,
    borderRadius: 8,
    maxWidth: Dimensions.get('window').width - 50,
    backgroundColor: theme['color-background-activity'],
    borderWidth: 1,
    borderColor: theme['color-border-activity'],
  },
  activityDateView: {
    alignItems: 'flex-end',
  },

  messageActivity: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 16,
    height: 16,
  },

  messageContent: {
    fontSize: theme['font-size-regular'],
    fontWeight: theme['font-regular'],
    color: theme['text-basic-color'],
  },

  date: {
    color: theme['text-hint-color'],
    fontSize: theme['font-size-extra-extra-small'],
  },

  messageBubble: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },

  outgoingMessageThumbnail: {
    marginLeft: 8,
  },

  incomingMessageThumbnail: {
    marginRight: 8,
  },
});

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

const MessageContent = withStyles(MessageContentComponent, styles);

const ActivityMessageComponent = ({ eva: { style }, message, created_at }) => (
  <View style={style.activityView}>
    <View style={style.messageActivity}>
      <CustomText style={style.messageContent}>{message.content}</CustomText>
    </View>
    <View style={style.activityDateView}>
      <CustomText style={style.date}>{messageStamp({ time: created_at })}</CustomText>
    </View>
  </View>
);

const ActivityMessage = withStyles(ActivityMessageComponent, styles);

const propTypes = {
  eva: PropTypes.shape({
    style: PropTypes.object,
    theme: PropTypes.object,
  }),
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

const ChatMessageComponent = ({ message, eva: { style }, showAttachment, conversation }) => {
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
    <View style={[style.message, !shouldShowFullWidth ? { justifyContent: alignment } : null]}>
      <View style={[shouldShowFullWidth ? style.emailContainer : {}]}>
        {alignment === 'flex-start' ? (
          <View style={style.messageBubble}>
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
          <View style={style.messageBubble}>
            <MessageContent
              conversation={conversation}
              message={message}
              created_at={created_at}
              type="outgoing"
              showAttachment={showAttachment}
            />
            {!isTwitterChannel ? (
              <View style={style.outgoingMessageThumbnail}>
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

const ChatMessage = withStyles(ChatMessageComponent, styles);

ChatMessage.defaultProps = defaultProps;
ChatMessage.propTypes = propTypes;

export default React.memo(ChatMessage);
