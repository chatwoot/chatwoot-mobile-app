import React, { useMemo, useRef, useCallback } from 'react';
import { useTheme } from '@react-navigation/native';
import { Dimensions, View, StyleSheet, Alert } from 'react-native';
import PropTypes from 'prop-types';
import { Icon, Pressable, Text } from 'components';
import Clipboard from '@react-native-clipboard/clipboard';
import { messageStamp } from 'helpers/TimeHelper';
import { useDispatch } from 'react-redux';
import { openURL } from 'helpers/UrlHelper';
import { UserAvatar } from 'components';
import ChatMessageActionItem from './ChatMessageActionItem';
import { showToast } from 'helpers/ToastHelper';
import Markdown, { MarkdownIt } from 'react-native-markdown-display';
import Email from '../components/Email';
import ChatAttachmentItem from './ChatAttachmentItem';
import MessageDeliveryStatus from './MessageDeliveryStatus';
import { MESSAGE_STATUS, INBOX_TYPES } from 'constants';
import conversationActions from 'reducer/conversationSlice.action';
import i18n from 'i18n';

import BottomSheetModal from 'components/BottomSheet/BottomSheet';
const deviceHeight = Dimensions.get('window').height;

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
    emailMessageBody: {
      minWidth: Dimensions.get('window').width - 44,
      maxWidth: Dimensions.get('window').width - 44,
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
    bottomSheetView: {
      flex: 1,
      paddingHorizontal: spacing.small,
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
    id: PropTypes.number,
  }),
  type: PropTypes.string,
  created_at: PropTypes.number,
  message: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
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
  const { attachments, sender = {} } = message;
  const dispatch = useDispatch();

  const { meta, id: conversationId } = conversation;
  const { id: messageId } = message;
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

  const { content_attributes: { external_created_at = null, deleted = false } = {} } = message;

  const messageActionModal = useRef(null);
  const messageActionModalSnapPoints = useMemo(() => [deviceHeight - 640, deviceHeight - 640], []);
  const toggleMessageActionModal = useCallback(() => {
    if (deleted) {
      return;
    }
    messageActionModal.current.present() || messageActionModal.current?.dismiss();
  }, [deleted]);

  const closeMessageActionModal = useCallback(() => {
    messageActionModal.current?.dismiss();
  }, []);

  const onPressItem = ({ itemType }) => {
    closeMessageActionModal();
    if (itemType === 'copy') {
      Clipboard.setString(message.content);
      showToast({ message: i18n.t('CONVERSATION.COPY_MESSAGE') });
    } else if (itemType === 'delete') {
      Alert.alert(
        i18n.t('CONVERSATION.DELETE_MESSAGE_TITLE'),
        i18n.t('CONVERSATION.DELETE_MESSAGE_SUB_TITLE'),
        [
          {
            text: i18n.t('EXIT.CANCEL'),
            onPress: () => {},
            style: 'cancel',
          },
          {
            text: i18n.t('EXIT.OK'),
            onPress: () => {
              dispatch(conversationActions.deleteMessage({ conversationId, messageId }));
            },
          },
        ],
        { cancelable: false },
      );
      return true;
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

  const readableTime = messageStamp({
    time: external_created_at || created_at,
    dateFormat: 'LLL d, h:mm a',
  });

  const isMessageContentExist = emailMessageContent() || message.content;

  return (
    <Pressable onLongPress={toggleMessageActionModal}>
      <View
        style={[
          styles.message,
          messageViewStyle,
          message.private && styles.privateMessageContainer,
          !isEmailChannel ? styles.messageBody : styles.emailMessageBody,
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
        <BottomSheetModal
          bottomSheetModalRef={messageActionModal}
          initialSnapPoints={messageActionModalSnapPoints}
          closeFilter={closeMessageActionModal}
          children={
            <View style={styles.bottomSheetView}>
              {senderName ? (
                <ChatMessageActionItem
                  text={`Sent by: ${senderName}`}
                  itemType="author"
                  onPressItem={onPressItem}
                />
              ) : null}
              <ChatMessageActionItem text="Copy" itemType="copy" onPressItem={onPressItem} />
              <ChatMessageActionItem text="Delete" itemType="delete" onPressItem={onPressItem} />
            </View>
          }
        />
      </View>
      {!isPrivate && isTwitterChannel ? twitterSenderNameView() : null}
    </Pressable>
  );
};

ChatMessageItemComponent.propTypes = propTypes;
export default React.memo(ChatMessageItemComponent);
