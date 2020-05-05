/* eslint-disable react/prop-types */
import React from 'react';
import { View, Dimensions } from 'react-native';
import PropTypes from 'prop-types';

import { withStyles } from '@ui-kitten/components';

import CustomText from './Text';

import { messageStamp } from '../helpers/TimeHelper';
import ChatAttachmentItem from '../components/ChatAttachmentItem';
import ChatMessageItem from '../components/ChatMessageItem';

const styles = (theme) => ({
  message: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },

  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
});

const MessageContentComponent = ({
  themedStyle,
  message,
  type,
  showAttachment,
  theme,
  created_at,
}) => {
  const { attachments } = message;

  return attachments ? (
    <ChatAttachmentItem
      attachment={attachments}
      type={type}
      showAttachment={showAttachment}
    />
  ) : (
    <ChatMessageItem message={message} type={type} created_at={created_at} />
  );
};

const MessageContent = withStyles(MessageContentComponent, styles);

const OutGoingMessageComponent = ({
  themedStyle,
  message,
  created_at,
  showAttachment,
}) => (
  <React.Fragment>
    <MessageContent
      message={message}
      created_at={created_at}
      type="outgoing"
      showAttachment={showAttachment}
    />
  </React.Fragment>
);

const OutGoingMessage = withStyles(OutGoingMessageComponent, styles);

const IncomingMessageComponent = ({
  themedStyle,
  message,
  created_at,

  showAttachment,
}) => (
  <React.Fragment>
    <MessageContent
      message={message}
      created_at={created_at}
      type="incoming"
      showAttachment={showAttachment}
    />
  </React.Fragment>
);

const IncomingMessage = withStyles(IncomingMessageComponent, styles);

const ActivityMessageComponent = ({
  themedStyle,
  message,
  created_at,
  theme,
}) => (
  <View style={themedStyle.activityView}>
    <View style={themedStyle.messageActivity}>
      <CustomText style={themedStyle.messageContent}>
        {message.content}
      </CustomText>
    </View>
    <View style={themedStyle.activityDateView}>
      <CustomText style={themedStyle.date}>
        {messageStamp({ time: created_at })}
      </CustomText>
    </View>
  </View>
);

const ActivityMessage = withStyles(ActivityMessageComponent, styles);

const propTypes = {
  message: PropTypes.shape({
    content: PropTypes.string,
    date: PropTypes.string,
  }),
  themedStyle: PropTypes.object,
  showAttachment: PropTypes.func,
};

const defaultProps = {
  message: { content: null, date: null },
};

const ChatMessageComponent = ({
  message,
  themedStyle,

  showAttachment,
}) => {
  const { message_type, created_at } = message;

  let alignment = message_type ? 'flex-end' : 'flex-start';
  if (message_type === 2) {
    alignment = 'center';
  }

  return (
    <View style={[themedStyle.message, { justifyContent: alignment }]}>
      <View style={themedStyle.messageContainer}>
        {alignment === 'flex-start' ? (
          <IncomingMessage
            message={message}
            created_at={created_at}
            type="incoming"
            showAttachment={showAttachment}
          />
        ) : alignment === 'center' ? (
          <ActivityMessage
            message={message}
            created_at={created_at}
            type="activity"
          />
        ) : (
          <OutGoingMessage
            message={message}
            created_at={created_at}
            type="outgoing"
            showAttachment={showAttachment}
          />
        )}
      </View>
    </View>
  );
};

const ChatMessage = withStyles(ChatMessageComponent, styles);

ChatMessage.defaultProps = defaultProps;
ChatMessage.propTypes = propTypes;

export default ChatMessage;
