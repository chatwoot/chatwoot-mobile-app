import React, { createRef, useMemo } from 'react';
import { useTheme } from '@react-navigation/native';
import { Dimensions, View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { Icon, Pressable, Text } from 'components';
import Clipboard from '@react-native-clipboard/clipboard';
import ActionSheet from 'react-native-actions-sheet';
import { messageStamp } from 'helpers/TimeHelper';
import { openURL } from 'helpers/UrlHelper';
import { UserAvatar } from 'components';
import ChatMessageActionItem from './ChatMessageActionItem';
import { showToast } from 'helpers/ToastHelper';
import Markdown, { MarkdownIt } from 'react-native-markdown-display';
import Email from '../components/Email';
import ChatAttachmentItem from './ChatAttachmentItem';
import MessageDeliveryStatus from './MessageDeliveryStatus';
import { MESSAGE_STATUS, INBOX_TYPES } from 'constants';

const createStyles = theme => {
  const { spacing, borderRadius, fontSize, colors } = theme;
  return StyleSheet.create({
    message: {
      paddingLeft: spacing.small,
      paddingRight: spacing.small,
      paddingTop: spacing.smaller,
      paddingBottom: spacing.smaller,
    },
    messageBody: {
      maxWidth: Dimensions.get('window').width - 100,
    },
    messageLeft: {
      borderBottomLeftRadius: borderRadius.micro,
      borderTopLeftRadius: borderRadius.micro,
      borderTopRightRadius: borderRadius.small,
      borderBottomRightRadius: borderRadius.small,
      borderWidth: 1,
      borderColor: colors.borderLight,
      backgroundColor: colors.background,
    },
    messageRight: {
      borderBottomLeftRadius: borderRadius.small,
      borderTopLeftRadius: borderRadius.small,
      borderTopRightRadius: borderRadius.micro,
      borderBottomRightRadius: borderRadius.micro,
    },
    messageContentRight: {
      fontSize: fontSize.sm,
    },
    messagePrivate: {
      color: colors.textDark,
    },
    messageContentLeft: {
      color: colors.textDarker,
      fontSize: fontSize.sm,
    },
    dateTextView: {
      paddingTop: spacing.micro,
    },
    privateMessageContainer: {
      backgroundColor: colors.backgroundPrivateLight,
      borderWidth: 1,
      borderColor: colors.backgroundPrivate,
      maxWidth: Dimensions.get('window').width - 60,
    },
    iconView: {
      paddingLeft: spacing.smaller,
    },
    linkStyle: {
      textDecorationLine: 'underline',
    },
    dateView: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    mailHeadWrap: {
      paddingBottom: spacing.smaller,
    },
    emailFields: {
      paddingVertical: spacing.tiny,
    },
    screenNameWithAvatar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.micro,
    },
    senderScreenName: {
      paddingHorizontal: spacing.micro,
    },
  });
};

const propTypes = {
  conversation: PropTypes.shape({
    meta: PropTypes.shape({
      channel: PropTypes.string,
    }),
    contact_last_seen_at: PropTypes.number,
    channel: PropTypes.string,
  }),
  type: PropTypes.string,
  created_at: PropTypes.number,
  message: PropTypes.shape({
    sender: PropTypes.shape({
      name: PropTypes.string,
      thumbnail: PropTypes.string,
      type: PropTypes.string,
    }),
    attachments: PropTypes.array,
    content: PropTypes.string,
    content_attributes: PropTypes.object,
    private: PropTypes.bool,
    status: PropTypes.string,
    template: PropTypes.number,
    created_at: PropTypes.number,
    source_id: PropTypes.string,
  }),
  showAttachment: PropTypes.func,
  isEmailChannel: PropTypes.bool,
};

const ChatMessageItemComponent = ({ conversation, type, message, created_at, showAttachment }) => {
  const theme = useTheme();
  const { colors, fontWeight } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const actionSheetRef = createRef();
  const { attachments, sender = {} } = message;

  const { meta } = conversation;
  const channel = conversation.channel ? conversation.channel : meta.channel;

  const isEmailChannel = channel === INBOX_TYPES.EMAIL;

  const isTwitterChannel = channel === INBOX_TYPES.TWITTER;

  const checkMessageSentByBot = () => {
    const { status } = message;
    if (status === MESSAGE_STATUS.PROGRESS || status === MESSAGE_STATUS.FAILED) {
      return false;
    }
    return !message?.sender?.type || message?.sender?.type === 'agent_bot';
  };

  const hasLargeMessagesLength = message?.content?.length > 100;

  const isSentByBot = checkMessageSentByBot();

  const senderName = sender && sender.name ? sender.name : '';

  const messageBodyStyle =
    hasLargeMessagesLength && !isEmailChannel
      ? { flex: 1, minWidth: '100%' }
      : { flex: 1, minWidth: 100 };

  const messageViewStyle =
    type === 'outgoing'
      ? {
          ...styles.messageRight,
          backgroundColor: isSentByBot ? '#AC52FF' : colors.primaryColor,
        }
      : styles.messageLeft;
  const messageTextStyle =
    type === 'outgoing'
      ? {
          ...styles.messageContentRight,
          color: isSentByBot ? colors.colorWhite : colors.colorWhite,
        }
      : styles.messageContentLeft;
  const emailHeadLabelColor = type === 'outgoing' ? colors.colorWhite : colors.textDarker;
  const emailHeadTextColor = type === 'outgoing' ? colors.colorWhite : colors.textDarker;
  const dateStyleColor = () => {
    if (isPrivate) {
      return colors.textLighter;
    }
    if (type === 'outgoing') {
      return colors.colorWhite;
    }
    return colors.textLight;
  };

  const listIconColor = () => {
    if (isPrivate) {
      return colors.textDark;
    }
    if (type === 'outgoing') {
      return colors.colorWhite;
    }
    return colors.textDark;
  };

  const handleURL = URL => {
    if (/\b(http|https)/.test(URL)) {
      openURL({ URL });
    }
  };

  const showTooltip = () => {
    actionSheetRef.current?.setModalVisible();
  };

  const twitterSenderNameView = () => {
    if (meta) {
      const { thumbnail, additional_attributes: additionalAttributes } = message && message.sender;

      const twitterSenderScreenName = additionalAttributes?.screen_name || '';
      const twitterSenderAvatarUrl = thumbnail || '';

      const openTwitterSenderProfile = name => {
        if (isTwitterChannel) {
          openURL({
            URL: `https://twitter.com/${name}`,
          });
        }
      };

      return (
        <Pressable onPress={() => openTwitterSenderProfile(twitterSenderScreenName)}>
          <View style={styles.screenNameWithAvatar}>
            <UserAvatar
              thumbnail={twitterSenderAvatarUrl}
              userName={twitterSenderScreenName}
              defaultBGColor={colors.primaryColor}
              size={14}
            />
            <Text xs color={colors.primaryColor} style={styles.senderScreenName}>
              {senderName}
            </Text>
          </View>
        </Pressable>
      );
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

  const messageContentStyle = {
    ...messageTextStyle,
    ...(isPrivate ? styles.messagePrivate : {}),
    lineHeight: 20,
  };

  const contentAttributes = (message && message.content_attributes) || {};

  const fromEmail = () => {
    const from = (contentAttributes.email && contentAttributes.email.from) || [];
    return from.join(', ');
  };

  const toEmail = () => {
    const from = (contentAttributes.email && contentAttributes.email.to) || [];
    return from.join(', ');
  };

  const ccEmail = () => {
    if (type === 'incoming') {
      const cc = contentAttributes.cc_email || [];
      return cc.join(', ');
    }
    if (type === 'outgoing') {
      const cc = contentAttributes.cc_emails || [];
      return cc.join(', ');
    }
  };

  const bccEmail = () => {
    if (type === 'incoming') {
      const bcc = contentAttributes.bcc_email || [];
      return bcc.join(', ');
    }
    if (type === 'outgoing') {
      const bcc = contentAttributes.bcc_emails || [];
      return bcc.join(', ');
    }
  };

  const subjectText = () => {
    return (contentAttributes.email && contentAttributes.email.subject) || '';
  };

  const hasAnyEmailValues = () => {
    return subjectText() || fromEmail() || toEmail() || ccEmail() || bccEmail();
  };

  const emailHeaderValues = [
    {
      key: 'from',
      value: fromEmail(),
      title: 'From: ',
    },
    {
      key: 'to',
      value: toEmail(),
      title: 'To: ',
    },
    {
      key: 'cc',
      value: ccEmail(),
      title: 'Cc: ',
    },
    {
      key: 'bcc',
      value: bccEmail(),
      title: 'Bcc: ',
    },
    {
      key: 'subject',
      value: subjectText(),
      title: 'Subject: ',
    },
  ];

  const emailHeader = emailHeaderValues
    .map(({ key, value, title }) =>
      value ? (
        <View style={styles.emailFields} key={key}>
          <Text xs semiBold color={emailHeadLabelColor}>
            {title}
            <Text xs regular color={emailHeadTextColor}>
              {value}
            </Text>
          </Text>
        </View>
      ) : null,
    )
    .filter(displayItem => !!displayItem);

  const MessageContent = () => {
    if (emailMessageContent()) {
      return <Email emailContent={emailMessageContent()} />;
    } else {
      return (
        <Markdown
          mergeStyle
          markdownit={MarkdownIt({
            linkify: true,
            typographer: true,
          })}
          onLinkPress={handleURL}
          style={{
            body: messageBodyStyle,
            link: {
              color: colors.primaryColor,
              fontWeight: isPrivate ? fontWeight.semiBold : fontWeight.regular,
            },
            text: messageContentStyle,
            strong: {
              fontWeight: fontWeight.semiBold,
            },
            paragraph: {
              marginTop: 0,
              marginBottom: 0,
            },
            bullet_list_icon: {
              color: listIconColor(),
              marginTop: 2,
            },
            ordered_list_icon: {
              color: listIconColor(),
              marginTop: 1,
            },
            blockquote: {
              backgroundColor: colors.primaryColor,
              color: colors.blockColor,
            },
          }}>
          {message.content}
        </Markdown>
      );
    }
  };

  const emailMessageContent = () => {
    const {
      html_content: { full: fullHTMLContent } = {},
      text_content: { full: fullTextContent } = {},
    } = (message && message.content_attributes && message.content_attributes.email) || {};
    return fullHTMLContent || fullTextContent || '';
  };

  const { content_attributes: { external_created_at = null } = {} } = message;
  const readableTime = messageStamp({
    time: external_created_at || created_at,
    dateFormat: 'LLL d, h:mm a',
  });

  const isMessageContentExist = emailMessageContent() || message.content;

  return (
    <Pressable onLongPress={showTooltip}>
      <View
        style={[
          styles.message,
          messageViewStyle,
          message.private && styles.privateMessageContainer,
          !isEmailChannel && styles.messageBody,
        ]}>
        {hasAnyEmailValues() ? <View style={styles.mailHeadWrap}>{emailHeader}</View> : null}
        {isMessageContentExist && <MessageContent />}

        <ChatAttachmentItem
          attachments={attachments}
          message={message}
          type={type}
          showAttachment={showAttachment}
        />

        <View style={styles.dateView}>
          <Text xxs color={dateStyleColor()} style={styles.dateTextView}>
            {readableTime}
          </Text>
          {isPrivate && (
            <View style={styles.iconView}>
              <Icon icon="lock-closed-outline" color={colors.textLight} size={16} />
            </View>
          )}
          <MessageDeliveryStatus
            message={message}
            type={type}
            channel={channel}
            contactLastSeenAt={conversation.contact_last_seen_at}
          />
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
      {!isPrivate && isTwitterChannel ? twitterSenderNameView() : null}
    </Pressable>
  );
};

ChatMessageItemComponent.propTypes = propTypes;
export default ChatMessageItemComponent;
