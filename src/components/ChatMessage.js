import React, { Component } from 'react';

import { View, StyleSheet, Dimensions } from 'react-native';

import PropTypes from 'prop-types';

import CustomText from './Text';

import { theme } from '../theme';

const propTypes = {
  message: PropTypes.shape({
    text: PropTypes.string,
    date: PropTypes.string,
    alignment: PropTypes.string,
  }),
};

const defaultProps = {
  message: { text: null, date: null, alignment: 'flex-start' },
};

class ChatMessage extends Component {
  render() {
    const { message } = this.props;

    const { alignment } = message;

    return (
      <View style={[styles.message, { justifyContent: alignment }]}>
        <View style={styles.messageContainer}>
          {alignment === 'flex-start' ? (
            <React.Fragment>
              <View style={styles.messageLeft}>
                <CustomText style={styles.messageContent}>
                  {message.text}
                </CustomText>
              </View>
              <CustomText style={styles.date}>{message.date}</CustomText>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <CustomText style={styles.date}>{message.date}</CustomText>
              <View style={styles.messageRight}>
                <CustomText style={styles.messageContent}>
                  {message.text}
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
    fontWeight: theme['font-light'],
  },
});

ChatMessage.defaultProps = defaultProps;
ChatMessage.propTypes = propTypes;

export default ChatMessage;
