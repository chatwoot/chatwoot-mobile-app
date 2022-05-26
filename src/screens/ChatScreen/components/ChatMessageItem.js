import React, { createRef } from 'react';
import { TouchableOpacity, Dimensions, View } from 'react-native';
import PropTypes from 'prop-types';
import { withStyles, Icon } from '@ui-kitten/components';
import Clipboard from '@react-native-clipboard/clipboard';
import Markdown from 'react-native-markdown-display';
import ActionSheet from 'react-native-actions-sheet';
import CustomText from 'components/Text';
import { messageStamp } from 'helpers/TimeHelper';
import { openURL } from 'helpers/UrlHelper';
import ChatMessageActionItem from './ChatMessageActionItem';
import { showToast } from 'helpers/ToastHelper';
// import { TweetContext } from '../contexts/TweetContext';

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
  bottomIconWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  twitterActionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 4,
    paddingLeft: 16,
    width: 60,
    justifyContent: 'space-between',
  },
});

const propTypes = {
  eva: PropTypes.shape({
    style: PropTypes.object,
    theme: PropTypes.object,
  }),
  type: PropTypes.string,
  created_at: PropTypes.number,
  meta: PropTypes.object,
  message: PropTypes.shape({
    sender: PropTypes.shape({
      name: PropTypes.string,
    }),
    id: PropTypes.number,
    content: PropTypes.string,
    private: PropTypes.bool,
  }),
  attachment: PropTypes.object,
};

const ChatMessageItemComponent = ({ type, meta, message, eva: { style, theme }, created_at }) => {
  const actionSheetRef = createRef();
  const senderName = message && message.sender && message.sender.name ? message.sender.name : '';
  const messageViewStyle = type === 'outgoing' ? style.messageRight : style.messageLeft;
  const messageTextStyle =
    type === 'outgoing' ? style.messageContentRight : style.messageContentLeft;
  const dateStyle = type === 'outgoing' ? style.dateRight : style.dateLeft;

  const handleURL = URL => {
    if (/\b(http|https)/.test(URL)) {
      openURL({ URL });
    }
  };

  // const { setTweetContent } = useContext(TweetContext);

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

  const isTwitterChannel = () => {
    return meta && meta.channel === 'Channel::TwitterProfile';
  };

  const selectedTweet = tweet => {
    // setTweetContent(tweet.content);
    // setTweetId(tweet.id);
  };

  const md = require('markdown-it')({
    html: true,
    linkify: true,
  });

  const isPrivate = message && message.private;

  const messageContentStyle = {
    ...messageTextStyle,
    ...(message.private ? style.messagePrivate : {}),
    lineHeight: 20,
  };

  return (
    <TouchableOpacity
      onLongPress={showTooltip}
      style={[style.message, messageViewStyle, message.private && style.privateMessageContainer]}
      activeOpacity={0.95}>
      <View>
        <Markdown
          debugPrintTree
          markdownit={md}
          mergeStyle
          onLinkPress={handleURL}
          style={{
            link: {
              color: theme['text-light-color'],
              fontWeight: message.private ? theme['font-semi-bold'] : theme['font-regular'],
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
        <View style={style.bottomIconWrap}>
          <View style={style.dateView}>
            <CustomText
              style={[
                dateStyle,
                message.private && {
                  color: theme['color-gray'],
                },
              ]}>
              {messageStamp({ time: created_at })}
            </CustomText>
            {message.private && (
              <View style={style.iconView}>
                <LockIcon style={style.icon} fill={theme['text-basic-color']} />
              </View>
            )}
          </View>
          {isTwitterChannel() && !isPrivate ? (
            <View style={style.twitterActionIcons}>
              <Icon
                name="corner-up-left-outline"
                width={16}
                height={16}
                fill={theme['text-basic-color']}
                onPress={() => {
                  selectedTweet(message);
                }}
              />
              <Icon
                name="external-link-outline"
                width={14}
                height={14}
                fill={theme['text-basic-color']}
              />
            </View>
          ) : null}
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
    </TouchableOpacity>
  );
};

ChatMessageItemComponent.propTypes = propTypes;

const ChatMessageItem = React.memo(withStyles(ChatMessageItemComponent, styles));
export default ChatMessageItem;
