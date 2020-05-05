/* eslint-disable react/prop-types */
import React from 'react';
import { View } from 'react-native';
import { withStyles } from '@ui-kitten/components';
import PropTypes from 'prop-types';
import CustomText from './Text';

const styles = (theme) => ({
  mainView: {
    flex: 1,
    flexDirection: 'row',
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateView: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: theme['color-background-date'],
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  text: {
    fontSize: theme['font-size-extra-small'],
  },
});

const ChatMessageDateComponent = ({ date, themedStyle }) => {
  return (
    <View style={themedStyle.mainView}>
      <View style={themedStyle.dateView}>
        <CustomText style={themedStyle.text}>{date}</CustomText>
      </View>
    </View>
  );
};

const propTypes = {
  date: PropTypes.string,
};

const defaultProps = {
  date: null,
};

const ChatMessageDate = withStyles(ChatMessageDateComponent, styles);

ChatMessageDate.defaultProps = defaultProps;
ChatMessageDate.propTypes = propTypes;

export default ChatMessageDate;
