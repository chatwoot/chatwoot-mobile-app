import React, { createRef } from 'react';
import { TouchableOpacity, Dimensions, View } from 'react-native';
import PropTypes from 'prop-types';
import { withStyles, Icon } from '@ui-kitten/components';
import Hyperlink from 'react-native-hyperlink';
import Clipboard from '@react-native-clipboard/clipboard';
import Markdown from 'react-native-markdown-display';

import ActionSheet from 'react-native-actions-sheet';
import CustomText from './Text';
import { messageStamp } from '../helpers/TimeHelper';
import { openURL } from '../helpers/UrlHelper';
import ChatMessageActionItem from './ChatMessageActionItem';
import { showToast } from '../helpers/ToastHelper';

const LockIcon = (style) => {
  return <Icon {...style} name="lock" />;
};

const styles = (theme) => ({
  messageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderBottomRightRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 4,
    borderTopLeftRadius: 4,
    maxWidth: Dimensions.get('window').width - 120,
    left: -4,
    backgroundColor: theme['background-basic-color-1'],
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },

  messageRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderBottomLeftRadius: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    maxWidth: Dimensions.get('window').width - 120,
    left: 4,
    backgroundColor: theme['color-primary-default'],
    marginLeft: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  messageContentRight: {
    color: theme['color-basic-100'],
    fontSize: theme['font-size-small'],
    fontWeight: theme['font-regular'],
  },
  messageContentLeft: {
    color: theme['text-light-color'],
    fontSize: theme['font-size-small'],
    fontWeight: theme['font-regular'],
  },
  dateRight: {
    color: theme['color-background-message'],
    fontSize: theme['font-size-extra-extra-small'],
  },
  dateLeft: {
    color: theme['color-gray'],
    fontSize: theme['font-size-extra-extra-small'],
  },
  privateMessageContainer: {
    backgroundColor: theme['color-background-activity'],
    color: theme['text-basic-color'],
    borderWidth: 1,
    borderColor: theme['color-border-activity'],
    padding: 16,
  },
  privateMessageView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconView: {
    paddingLeft: 8,
  },
  icon: {
    width: 16,
    height: 16,
  },
  linkStyle: {
    textDecorationLine: 'underline',
  },
  tooltipText: {
    color: theme['text-tooltip-color'],
    fontSize: theme['font-size-small'],
  },
});

const propTypes = {
  eva: PropTypes.shape({
    style: PropTypes.object,
    theme: PropTypes.object,
  }),
  type: PropTypes.string,
  created_at: PropTypes.number,
  message: PropTypes.shape({
    sender: PropTypes.shape({
      name: PropTypes.string,
    }),
    content: PropTypes.string,
    private: PropTypes.bool,
  }),
  attachment: PropTypes.object,
};

const ChatMessageItemComponent = ({ type, message, eva: { style, theme }, created_at }) => {
  const actionSheetRef = createRef();
  const senderName = message && message.sender && message.sender.name ? message.sender.name : '';
  const messageViewStyle = type === 'outgoing' ? style.messageRight : style.messageLeft;
  const messageTextStyle =
    type === 'outgoing' ? style.messageContentRight : style.messageContentLeft;
  const dateStyle = type === 'outgoing' ? style.dateRight : style.dateLeft;

  const handleURL = (URL) => {
    if (/\b(http|https)/.test(URL)) {
      openURL({ URL });
    }
  };

  const showTooltip = () => {
    actionSheetRef.current?.setModalVisible();
  };

  const onPressItem = ({ itemType }) => {
    actionSheetRef.current?.setModalVisible(false);

    if (itemType === 'copy') {
      Clipboard.setString(message.content);
      showToast({ message: 'Message copied to clipboard' });
    }
  };

  return (
    <TouchableOpacity
      onLongPress={showTooltip}
      style={[messageViewStyle, message.private && style.privateMessageContainer]}
      activeOpacity={0.95}>
      <View>
        {message.private ? (
          <View style={style.privateMessageView}>
            <Markdown
              onLinkPress={handleURL}
              style={{
                body: {
                  color: theme['text-basic-color'],
                  fontSize: theme['font-size-small'],
                  fontWeight: theme['font-regular'],
                },
                link: {
                  fontSize: theme['font-size-medium'],
                  color: theme['text-light-color'],
                  fontWeight: theme['font-bold'],
                },
              }}>
              {message.content}
            </Markdown>
            <View style={style.iconView}>
              <LockIcon style={style.icon} fill={theme['text-basic-color']} />
            </View>
          </View>
        ) : (
          <Hyperlink linkStyle={style.linkStyle} onPress={(url) => handleURL(url)}>
            <CustomText style={messageTextStyle}>{message.content}</CustomText>
          </Hyperlink>
        )}

        <CustomText
          style={[
            dateStyle,
            message.private && {
              color: theme['color-gray'],
            },
          ]}>
          {messageStamp({ time: created_at })}
        </CustomText>
        <ActionSheet ref={actionSheetRef} defaultOverlayOpacity={0.3}>
          {senderName ? (
            <ChatMessageActionItem
              text={`Sent by: ${senderName}`}
              itemType="author"
              onPressItem={onPressItem}
            />
          ) : null}
          <ChatMessageActionItem text="Copy" itemType="copy" onPressItem={onPressItem} />
        </ActionSheet>
      </View>
    </TouchableOpacity>
  );
};

ChatMessageItemComponent.propTypes = propTypes;

const ChatMessageItem = withStyles(ChatMessageItemComponent, styles);
export default ChatMessageItem;