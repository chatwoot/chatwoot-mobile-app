/* eslint-disable react/prop-types */
import React, { Component } from 'react';

import { View, StyleSheet, Dimensions } from 'react-native';

import PropTypes from 'prop-types';

import { Icon } from 'react-native-ui-kitten';

import CustomText from './Text';

import { theme } from '../theme';
import { messageStamp } from '../helpers/TimeHelper';

const PersonIcon = style => {
  return <Icon {...style} name="person-outline" />;
};

const IncomingMessage = ({ message, created_at }) => (
  <React.Fragment>
    <View style={styles.messageLeft}>
      <CustomText style={styles.messageContent}>{message.content}</CustomText>
    </View>
    <CustomText style={styles.date}>
      {messageStamp({ time: created_at })}
    </CustomText>
  </React.Fragment>
);

const OutGoingMessage = ({ message, created_at }) => (
  <React.Fragment>
    <CustomText style={styles.date}>
      {messageStamp({ time: created_at })}
    </CustomText>

    <View style={styles.messageRight}>
      <CustomText style={styles.messageContent}>{message.content}</CustomText>
    </View>
  </React.Fragment>
);

const ActivityMessage = ({ message, created_at }) => (
  <View style={styles.activityView}>
    <View style={styles.activityDateView}>
      <CustomText style={styles.date}>
        {messageStamp({ time: created_at })}
      </CustomText>
    </View>
    <View style={styles.messageActivity}>
      <PersonIcon style={styles.icon} />
      <CustomText style={styles.messageContent}>{message.content}</CustomText>
    </View>
  </View>
);

const propTypes = {
  message: PropTypes.shape({
    content: PropTypes.string,
    date: PropTypes.string,
  }),
};

const defaultProps = {
  message: { content: null, date: null },
};

class ChatMessage extends Component {
  render() {
    const { message } = this.props;

    const { message_type, created_at } = message;

    let alignment = message_type ? 'flex-end' : 'flex-start';
    if (message_type === 2) {
      alignment = 'center';
    }

    return (
      <View style={[styles.message, { justifyContent: alignment }]}>
        <View style={styles.messageContainer}>
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

const styles = StyleSheet.create({
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
    backgroundColor: theme['color-white'],
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
    color: theme['color-gray'],
    fontSize: theme['font-size-extra-extra-small'],
  },
});

ChatMessage.defaultProps = defaultProps;
ChatMessage.propTypes = propTypes;

export default ChatMessage;
