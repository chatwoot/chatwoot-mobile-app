/* eslint-disable react/prop-types */
import React, { Component } from 'react';

import { View, Dimensions } from 'react-native';

import PropTypes from 'prop-types';

import { Icon, withStyles } from '@ui-kitten/components';

import CustomText from './Text';

import { messageStamp } from '../helpers/TimeHelper';

const styles = theme => ({
  message: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },

  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  messageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderBottomRightRadius: 8,
    borderTopRightRadius: 8,
    maxWidth: Dimensions.get('window').width - 120,
    left: -4,
    backgroundColor: theme['background-basic-color-1'],
    marginRight: 16,
  },

  messageRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderBottomLeftRadius: 8,
    borderTopLeftRadius: 8,
    maxWidth: Dimensions.get('window').width - 120,
    left: 4,
    backgroundColor: theme['color-background-message'],
    marginLeft: 16,
  },

  activityView: {
    padding: 8,
    borderRadius: 8,
    maxWidth: Dimensions.get('window').width - 50,
    backgroundColor: theme['color-background-activity'],
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
    color: theme['text-active-color'],
    fontSize: theme['font-size-regular'],
    fontWeight: theme['font-regular'],
  },

  date: {
    fontStyle: 'italic',
    color: theme['text-hint-color'],
    fontSize: theme['font-size-extra-extra-small'],
  },
});

const PersonIcon = style => {
  return <Icon {...style} name="person-outline" />;
};

const IncomingMessageComponent = ({ themedStyle, message, created_at }) => (
  <React.Fragment>
    <View style={themedStyle.messageLeft}>
      <CustomText style={themedStyle.messageContent}>
        {message.content}
      </CustomText>
    </View>
    <CustomText style={themedStyle.date}>
      {messageStamp({ time: created_at })}
    </CustomText>
  </React.Fragment>
);

const IncomingMessage = withStyles(IncomingMessageComponent, styles);

const OutGoingMessageComponent = ({ themedStyle, message, created_at }) => (
  <React.Fragment>
    <CustomText style={themedStyle.date}>
      {messageStamp({ time: created_at })}
    </CustomText>

    <View style={themedStyle.messageRight}>
      <CustomText style={themedStyle.messageContent}>
        {message.content}
      </CustomText>
    </View>
  </React.Fragment>
);

const OutGoingMessage = withStyles(OutGoingMessageComponent, styles);

const ActivityMessageComponent = ({ themedStyle, message, created_at }) => (
  <View style={themedStyle.activityView}>
    <View style={themedStyle.activityDateView}>
      <CustomText style={themedStyle.date}>
        {messageStamp({ time: created_at })}
      </CustomText>
    </View>
    <View style={themedStyle.messageActivity}>
      <PersonIcon style={themedStyle.icon} />
      <CustomText style={themedStyle.messageContent}>
        {message.content}
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
};

const defaultProps = {
  message: { content: null, date: null },
};

class ChatMessageComponent extends Component {
  render() {
    const { message, themedStyle } = this.props;

    const { message_type, created_at } = message;

    let alignment = message_type ? 'flex-end' : 'flex-start';
    if (message_type === 2) {
      alignment = 'center';
    }

    return (
      <View style={[themedStyle.message, { justifyContent: alignment }]}>
        <View style={themedStyle.messageContainer}>
          {alignment === 'flex-start' ? (
            <IncomingMessage message={message} created_at={created_at} />
          ) : alignment === 'center' ? (
            <ActivityMessage message={message} created_at={created_at} />
          ) : (
            <OutGoingMessage message={message} created_at={created_at} />
          )}
        </View>
      </View>
    );
  }
}

const ChatMessage = withStyles(ChatMessageComponent, styles);

ChatMessage.defaultProps = defaultProps;
ChatMessage.propTypes = propTypes;

export default ChatMessage;
