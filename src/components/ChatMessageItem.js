import React, { useState } from 'react';
import { TouchableOpacity, Dimensions } from 'react-native';
import PropTypes from 'prop-types';
import { withStyles, Tooltip } from '@ui-kitten/components';

import CustomText from './Text';

const styles = (theme) => ({
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
    elevation: 1,
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
    elevation: 1,
  },
  messageContent: {
    color: theme['text-active-color'],
    fontSize: theme['font-size-regular'],
    fontWeight: theme['font-regular'],
  },
});

const propTypes = {
  themedStyle: PropTypes.object,
  theme: PropTypes.object,
  type: PropTypes.string,
  message: PropTypes.shape({
    sender: PropTypes.shape({
      name: PropTypes.string,
    }),
    content: PropTypes.string,
  }),
  attachment: PropTypes.object,
};

const ChatMessageItemComponent = ({ type, message, themedStyle, theme }) => {
  const [visible, setVisible] = useState(false);

  const [senderDetails, setSender] = useState('');

  const toggleTooltip = () => {
    setVisible(!visible);
    setSender('');
  };

  const showSender = () => {
    if (message.sender) {
      setVisible(!visible);
      setSender(`Sent by: ${message.sender.name}`);
    }
  };
  return (
    <TouchableOpacity
      style={
        type === 'outgoing' ? themedStyle.messageRight : themedStyle.messageLeft
      }
      activeOpacity={0.95}
      onPress={showSender}>
      <Tooltip
        text={senderDetails}
        placement="top start"
        visible={visible}
        onBackdropPress={toggleTooltip}>
        <CustomText style={themedStyle.messageContent}>
          {message.content}
        </CustomText>
      </Tooltip>
    </TouchableOpacity>
  );
};

ChatMessageItemComponent.propTypes = propTypes;

const ChatMessageItem = withStyles(ChatMessageItemComponent, styles);
export default ChatMessageItem;
