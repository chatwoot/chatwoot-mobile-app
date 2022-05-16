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
import ChatMessageActionItem from './ChatMessageActionItem';
import { showToast } from 'helpers/ToastHelper';

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
    backgroundColor: theme['color-background-private'],
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
  mailHeadWrap: {
    paddingBottom: 8,
  },
  emailFields: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  emailFieldsLabelLeft: {
    color: theme['text-light-color'],
    fontSize: theme['font-size-extra-small'],
    fontWeight: theme['font-semi-bold'],
  },
  emailFieldsLabelRight: {
    color: theme['color-background'],
    fontSize: theme['font-size-extra-small'],
    fontWeight: theme['font-semi-bold'],
  },
  emailFieldsValueLeft: {
    color: theme['text-light-color'],
    fontSize: theme['font-size-extra-small'],
  },
  emailFieldsValueRight: {
    color: theme['color-background'],
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
    content_attributes: PropTypes.object,
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
  const emailHeadLabelStyle =
    type === 'outgoing' ? style.emailFieldsLabelRight : style.emailFieldsLabelLeft;
  const emailHeadTextStyle =
    type === 'outgoing' ? style.emailFieldsValueRight : style.emailFieldsValueLeft;
  const dateStyle = type === 'outgoing' ? style.dateRight : style.dateLeft;

  const handleURL = URL => {
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

  const md = require('markdown-it')({
    html: true,
    linkify: true,
  });

  const messageContentStyle = {
    ...messageTextStyle,
    ...(message.private ? style.messagePrivate : {}),
    lineHeight: 20,
  };

  const fromEmail = () => {
    const from =
      (message.content_attributes &&
        message.content_attributes.email &&
        message.content_attributes.email.from) ||
      [];
    return from.join(', ');
  };

  const toEmail = () => {
    const from =
      (message.content_attributes &&
        message.content_attributes.email &&
        message.content_attributes.email.to) ||
      [];
    return from.join(', ');
  };

  const ccEmail = () => {
    if (type === 'incoming') {
      const cc = (message.content_attributes && message.content_attributes.cc_email) || [];
      return cc.join(', ');
    }
    if (type === 'outgoing') {
      const cc = (message.content_attributes && message.content_attributes.cc_emails) || [];
      return cc.join(', ');
    }
  };

  const bccEmail = () => {
    if (type === 'incoming') {
      const bcc = (message.content_attributes && message.content_attributes.bcc_email) || [];
      return bcc.join(', ');
    }
    if (type === 'outgoing') {
      const bcc = (message.content_attributes && message.content_attributes.bcc_emails) || [];
      return bcc.join(', ');
    }
  };

  const subjectText = () => {
    return (
      (message.content_attributes &&
        message.content_attributes.email &&
        message.content_attributes.email.subject) ||
      ''
    );
  };

  const hasAnyEmailValues = () => {
    return subjectText() || fromEmail() || toEmail() || ccEmail() || bccEmail();
  };

  return (
    <TouchableOpacity
      onLongPress={showTooltip}
      style={[style.message, messageViewStyle, message.private && style.privateMessageContainer]}
      activeOpacity={0.95}>
      <View>
        {hasAnyEmailValues() ? (
          <View style={style.mailHeadWrap}>
            {fromEmail() ? (
              <View style={style.emailFields}>
                <Text style={emailHeadLabelStyle}>{'From: '}</Text>
                <CustomText style={emailHeadTextStyle}>{fromEmail()}</CustomText>
              </View>
            ) : null}

            {toEmail() ? (
              <View style={style.emailFields}>
                <Text style={emailHeadLabelStyle}>{'To: '}</Text>
                <CustomText style={emailHeadTextStyle}>{toEmail()}</CustomText>
              </View>
            ) : null}

            {ccEmail() ? (
              <View style={style.emailFields}>
                <Text style={emailHeadLabelStyle}>{'CC: '}</Text>
                <CustomText style={emailHeadTextStyle}>{ccEmail()}</CustomText>
              </View>
            ) : null}

            {bccEmail() ? (
              <View style={style.emailFields}>
                <Text style={emailHeadLabelStyle}>{'BCC: '}</Text>
                <CustomText style={emailHeadTextStyle}>{bccEmail()}</CustomText>
              </View>
            ) : null}

            {subjectText() ? (
              <View style={style.emailFields}>
                <Text style={emailHeadLabelStyle}>{'Subject: '}</Text>
                <CustomText style={emailHeadTextStyle}>{subjectText()}</CustomText>
              </View>
            ) : null}

            <View style={style.dateView}>
              {message.private && (
                <View style={style.iconView}>
                  <LockIcon style={style.icon} fill={theme['text-basic-color']} />
                </View>
              )}
            </View>
          </View>
        ) : null}
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
