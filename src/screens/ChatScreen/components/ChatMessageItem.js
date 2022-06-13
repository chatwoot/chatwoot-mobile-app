import React, { createRef } from 'react';
import { TouchableOpacity, Dimensions, View, Text } from 'react-native';
import PropTypes from 'prop-types';
import { withStyles, Icon } from '@ui-kitten/components';
import Clipboard from '@react-native-clipboard/clipboard';
import Markdown from 'react-native-markdown-display';
import ActionSheet from 'react-native-actions-sheet';
import CustomText from 'components/Text';
import { messageStamp } from 'helpers/TimeHelper';
import { openURL } from 'helpers/UrlHelper';
import UserAvatar from 'src/components/UserAvatar';
import ChatMessageActionItem from './ChatMessageActionItem';
import { showToast } from 'helpers/ToastHelper';
import { useRoute } from '@react-navigation/native';

const LockIcon = style => {
  return <Icon {...style} name="lock" />;
};

const styles = theme => ({
  message: {
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 8,
    paddingBottom: 8,
    maxWidth: Dimensions.get('window').width - 60,
  },
  messageLeft: {
    borderBottomLeftRadius: 4,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    borderWidth: 1,
    borderColor: theme['color-border'],
    backgroundColor: theme['background-basic-color-1'],
  },
  messageRight: {
    borderBottomLeftRadius: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    backgroundColor: theme['color-primary-default'],
  },
  messageContentRight: {
    color: theme['color-basic-100'],
    fontSize: theme['font-size-small'],
  },
  messagePrivate: {
    color: theme['text-basic-color'],
  },
  messageContentLeft: {
    color: theme['text-light-color'],
    fontSize: theme['font-size-small'],
  },
  dateRight: {
    color: theme['color-background-message'],
    fontSize: theme['font-size-extra-extra-small'],
    paddingTop: 4,
  },
  dateLeft: {
    color: theme['color-gray'],
    fontSize: theme['font-size-extra-extra-small'],
    paddingTop: 4,
  },
  privateMessageContainer: {
    backgroundColor: theme['color-background-private-light'],
    borderWidth: 1,
    borderColor: theme['color-border-private'],
    maxWidth: Dimensions.get('window').width - 40,
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
  dateView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  screenNameWithAvatar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  senderScreenName: {
    paddingHorizontal: 4,
    color: theme['color-primary-500'],
    fontSize: theme['font-size-extra-small'],
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
  const route = useRoute();
  const actionSheetRef = createRef();
  const { meta } = route.params;
  const senderName = message && message.sender && message.sender.name ? message.sender.name : '';
  const messageViewStyle = type === 'outgoing' ? style.messageRight : style.messageLeft;
  const messageTextStyle =
    type === 'outgoing' ? style.messageContentRight : style.messageContentLeft;
  const dateStyle = type === 'outgoing' ? style.dateRight : style.dateLeft;

  const { additional_attributes: additionalAttributes = {} } = meta.sender;
  const { screen_name: screenName } = additionalAttributes;

  const handleURL = URL => {
    if (/\b(http|https)/.test(URL)) {
      openURL({ URL });
    }
  };

  const showTooltip = () => {
    actionSheetRef.current?.setModalVisible();
  };

  const twitterSenderAvatarUrl = meta.sender.thumbnail || '';

  const isTwitterChannel = () => {
    return meta && meta.channel === 'Channel::TwitterProfile';
  };

  const twitterSenderScreenName = screenName || '';

  const openTwitterSenderProfile = () => {
    if (isTwitterChannel()) {
      openURL({
        URL: `https://twitter.com/${twitterSenderScreenName}`,
      });
    }
  };

  const onPressItem = ({ itemType }) => {
    actionSheetRef.current?.setModalVisible(false);

    if (itemType === 'copy') {
      Clipboard.setString(message.content);
      showToast({ message: 'Message copied to clipboard' });
    }
  };

  const isPrivate = message.private;

  const md = require('markdown-it')({
    html: true,
    linkify: true,
  });

  const messageContentStyle = {
    ...messageTextStyle,
    ...(isPrivate ? style.messagePrivate : {}),
    lineHeight: 20,
  };

  return (
    <TouchableOpacity onLongPress={showTooltip} activeOpacity={0.95}>
      <View style={[style.message, messageViewStyle, isPrivate && style.privateMessageContainer]}>
        <Markdown
          debugPrintTree
          markdownit={md}
          mergeStyle
          onLinkPress={handleURL}
          style={{
            link: {
              color: theme['text-light-color'],
              fontWeight: isPrivate ? theme['font-semi-bold'] : theme['font-regular'],
            },
            text: messageContentStyle,
            strong: {
              fontWeight: theme['font-semi-bold'],
            },
            paragraph: {
              marginTop: 0,
              marginBottom: 0,
            },
            code_inline: {
              fontFamily: 'System',
            },
          }}>
          {message.content}
        </Markdown>
        <View style={style.dateView}>
          <CustomText
            style={[
              dateStyle,
              isPrivate && {
                color: theme['color-gray'],
              },
            ]}>
            {messageStamp({ time: created_at })}
          </CustomText>
          {isPrivate && (
            <View style={style.iconView}>
              <LockIcon style={style.icon} fill={theme['text-basic-color']} />
            </View>
          )}
        </View>
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
      {isTwitterChannel() && !isPrivate ? (
        <View style={style.screenNameWithAvatar}>
          <UserAvatar
            thumbnail={twitterSenderAvatarUrl}
            userName={twitterSenderScreenName}
            defaultBGColor={theme['color-primary-default']}
            size={14}
          />
          <Text onPress={openTwitterSenderProfile} style={style.senderScreenName}>
            {senderName}
          </Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

ChatMessageItemComponent.propTypes = propTypes;

const ChatMessageItem = React.memo(withStyles(ChatMessageItemComponent, styles));
export default ChatMessageItem;
