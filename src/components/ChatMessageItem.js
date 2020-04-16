import React, { useState } from 'react';
import { TouchableOpacity, Dimensions, View } from 'react-native';
import PropTypes from 'prop-types';
import { withStyles, Tooltip, Icon } from '@ui-kitten/components';

import CustomText from './Text';

const LockIcon = (style) => {
  return <Icon {...style} name="lock-outline" />;
};

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
  privateMessageView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 16,
    height: 16,
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
    private: PropTypes.bool,
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
  const messageViewStyle =
    type === 'outgoing' ? themedStyle.messageRight : themedStyle.messageLeft;

  return (
    <TouchableOpacity
      style={[
        messageViewStyle,
        message.private && {
          backgroundColor: theme['color-background-activity'],
        },
      ]}
      activeOpacity={0.95}
      onPress={showSender}>
      <Tooltip
        text={senderDetails}
        placement="top start"
        visible={visible}
        onBackdropPress={toggleTooltip}>
        {message.private ? (
          <View style={themedStyle.privateMessageView}>
            <CustomText style={themedStyle.messageContent}>
              {message.content}
            </CustomText>

            <LockIcon
              style={themedStyle.icon}
              fill={theme['text-hint-color']}
            />
          </View>
        ) : (
          <CustomText style={themedStyle.messageContent}>
            {message.content}
          </CustomText>
        )}
      </Tooltip>
    </TouchableOpacity>
  );
};

ChatMessageItemComponent.propTypes = propTypes;

const ChatMessageItem = withStyles(ChatMessageItemComponent, styles);
export default ChatMessageItem;
