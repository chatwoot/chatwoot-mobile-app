import React, { Component } from 'react';

import { View, StyleSheet, Dimensions } from 'react-native';

import PropTypes from 'prop-types';

import CustomText from './Text';

import { theme } from '../theme';
import { messageStamp } from '../helpers/TimeHelper';

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
    const alignment = message_type ? 'flex-end' : 'flex-start';

    return (
      <View style={[styles.message, { justifyContent: alignment }]}>
        <View style={styles.messageContainer}>
          {alignment === 'flex-start' ? (
            <React.Fragment>
              <View style={styles.messageLeft}>
                <CustomText style={styles.messageContent}>
                  {message.content}
                </CustomText>
              </View>
              <CustomText style={styles.date}>
                {messageStamp({ time: created_at })}
              </CustomText>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <CustomText style={styles.date}>
                {messageStamp({ time: created_at })}
              </CustomText>
              <View style={styles.messageRight}>
                <CustomText style={styles.messageContent}>
                  {message.content}
                </CustomText>
              </View>
            </React.Fragment>
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
    marginVertical: 12,
  },

  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  messageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
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
    padding: 16,
    borderBottomLeftRadius: 8,
    borderTopLeftRadius: 8,
    maxWidth: Dimensions.get('window').width - 120,
    left: 4,
    backgroundColor: theme['color-background-message'],
    marginLeft: 16,
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
