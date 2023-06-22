import React, { useEffect, useState, useMemo } from 'react';
import { useTheme } from '@react-navigation/native';
import { View, Dimensions, TextInput, StyleSheet, Platform } from 'react-native';
import { Text, Icon, Pressable } from 'components';
import { MentionInput } from 'react-native-controlled-mentions';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import AttachmentPreview from './AttachmentPreview';
import Attachment from './Attachment';
import i18n from 'i18n';
import { findFileSize } from 'helpers/FileHelper';
import { MAXIMUM_FILE_UPLOAD_SIZE } from 'constants';
import { showToast } from 'helpers/ToastHelper';
import MentionUser from './MentionUser.js';
import AnalyticsHelper from 'helpers/AnalyticsHelper';
import { CONVERSATION_EVENTS } from 'constants/analyticsEvents';
import conversationActions from 'reducer/conversationSlice.action';
import CannedResponsesContainer from '../containers/CannedResponsesContainer';
import { inboxAgentSelectors, actions as inboxAgentActions } from 'reducer/inboxAgentsSlice';
import { selectUser } from 'reducer/authSlice';
import ModalView from 'components/Modal/ModalView.js';
import {
  getMessageVariables,
  getUndefinedVariablesInMessage,
  replaceVariablesInMessage,
} from '@chatwoot/utils';

const propTypes = {
  conversationId: PropTypes.number,
  conversationDetails: PropTypes.object,
  inboxId: PropTypes.number,
  enableReplyButton: PropTypes.bool,
};

const isAndroid = Platform.OS === 'android';

const ReplyBox = ({ conversationId, inboxId, conversationDetails, enableReplyButton }) => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [isPrivate, setPrivateMode] = useState(false);
  const [ccEmails, setCCEmails] = useState('');
  const [bccEmails, setBCCEmails] = useState('');
  const [emailFields, toggleEmailFields] = useState(false);
  const [message, setMessage] = useState('');
  const agents = useSelector(state => inboxAgentSelectors.inboxAssignedAgents(state));
  const [cannedResponseSearchKey, setCannedResponseSearchKey] = useState('');
  const [attachmentDetails, setAttachmentDetails] = useState(null);
  const [undefinedVariableText, setUndefinedVariableText] = useState('');
  const [showUndefinedVariablesModal, setUndefinedVariablesModal] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  useEffect(() => {
    if (inboxId) {
      dispatch(inboxAgentActions.fetchInboxAgents({ inboxId }));
    }
  }, [dispatch, inboxId]);

  const onNewMessageChange = text => {
    setMessage(text);
    if (text.charAt(0) === '/') {
      const query = text.substring(1) ? text.substring(1).toLowerCase() : ' ';
      setCannedResponseSearchKey(query);
    } else {
      setCannedResponseSearchKey('');
    }
  };
  const onCCMailChange = mail => {
    setCCEmails(mail);
  };
  const onBCCMailChange = mail => {
    setBCCEmails(mail);
  };

  const isAnEmailChannelAndNotInPrivateNote = () => {
    if (conversationDetails) {
      const channel = conversationDetails?.meta?.channel;
      return channel === 'Channel::Email' && !isPrivate;
    }
    return false;
  };

  const toggleCcBccInputs = () => {
    toggleEmailFields(true);
  };

  const inputBorderColor = () => {
    isAnEmailChannelAndNotInPrivateNote() ? { borderTopWidth: 0 } : { borderTopWidth: 1 };
  };

  const onBlur = () => {
    dispatch(conversationActions.toggleTypingStatus({ conversationId, typingStatus: 'off' }));
  };
  const onFocus = () => {
    dispatch(conversationActions.toggleTypingStatus({ conversationId, typingStatus: 'on' }));
  };

  const messageVariables = () => {
    const variables = getMessageVariables({
      conversation: conversationDetails,
    });
    return variables;
  };

  const onCannedResponseSelect = content => {
    const updatedContent = replaceVariablesInMessage({
      message: content,
      variables: messageVariables(),
    });
    AnalyticsHelper.track(CONVERSATION_EVENTS.INSERTED_A_CANNED_RESPONSE);
    setCannedResponseSearchKey('');
    setMessage(updatedContent);
  };

  const onSelectAttachment = ({ attachment }) => {
    AnalyticsHelper.track(CONVERSATION_EVENTS.SELECTED_ATTACHMENT);
    const { fileSize } = attachment;
    if (findFileSize(fileSize) <= MAXIMUM_FILE_UPLOAD_SIZE) {
      setAttachmentDetails(attachment);
    } else {
      showToast({ message: i18n.t('CONVERSATION.FILE_SIZE_LIMIT') });
    }
  };

  const onRemoveAttachment = () => {
    setAttachmentDetails(null);
  };

  const togglePrivateMode = () => {
    setPrivateMode(!isPrivate);
  };

  const onNewMessageAdd = () => {
    let updatedMessage = message;

    const undefinedVariables = getUndefinedVariablesInMessage({
      message: updatedMessage,
      variables: messageVariables(),
    });

    if (undefinedVariables.length > 0) {
      const undefinedVariablesCount = undefinedVariables.length > 1 ? undefinedVariables.length : 1;
      const undefinedVariablesText = undefinedVariables.join(', ');
      const undefinedVariablesMessage = `You have ${undefinedVariablesCount} undefined variable(s) in your message: ${undefinedVariablesText}. Please check and try again with valid variables.`;
      setUndefinedVariableText(undefinedVariablesMessage);
      setUndefinedVariablesModal(true);
    } else {
      if (isPrivate) {
        const regex = /@\[([\w\s]+)\]\((\d+)\)/g;
        updatedMessage = message.replace(
          regex,
          '[@$1](mention://user/$2/' + encodeURIComponent('$1') + ')',
        );
      }

      if (message || attachmentDetails) {
        const payload = {
          conversationId,
          message: updatedMessage,
          private: isPrivate,
          file: attachmentDetails,
          sender: {
            id: user.id,
            thumbnail: user.avatar_url,
          },
        };
        if (ccEmails) {
          payload.message.cc_emails = ccEmails;
        }
        if (bccEmails) {
          payload.message.bcc_emails = bccEmails;
        }
        AnalyticsHelper.track(CONVERSATION_EVENTS.SENT_MESSAGE);
        dispatch(conversationActions.sendMessage({ data: payload }));

        setMessage('');
        setCCEmails('');
        setBCCEmails('');
        setAttachmentDetails(null);
        setPrivateMode(false);
      }
    }
  };

  const inputFieldColor = () =>
    !isPrivate
      ? { backgroundColor: colors.backgroundLight }
      : { backgroundColor: colors.backgroundPrivate };

  const sendMessageButtonWrapStyles = () => {
    return !(!message && !attachmentDetails)
      ? { backgroundColor: colors.infoColorLighter }
      : { backgroundColor: colors.infoColorLight };
  };

  const renderSuggestions = ({ keyword, onSuggestionPress }) => {
    if (keyword == null || !isPrivate) {
      return null;
    }
    return (
      <View>
        {agents
          .filter(one => one.name.toLocaleLowerCase().includes(keyword.toLocaleLowerCase()))
          .map((item, index) => (
            <MentionUser
              name={item.name}
              thumbnail={item.thumbnail}
              availabilityStatus={item.availability_status}
              email={item.email}
              key={item.id}
              lastItem={agents.length - 1 === index}
              onUserSelect={() => onSuggestionPress(item)}
            />
          ))}
      </View>
    );
  };

  const enableReplyBox = (message || attachmentDetails) && enableReplyButton ? true : false;
  return (
    <React.Fragment>
      <View style={styles.replyBoxContainer}>
        {attachmentDetails && (
          <View style={styles.attachmentWrap}>
            <AttachmentPreview
              attachmentDetails={attachmentDetails}
              onRemoveAttachment={onRemoveAttachment}
            />
          </View>
        )}
        {cannedResponseSearchKey ? (
          <CannedResponsesContainer
            onClick={onCannedResponseSelect}
            searchKey={cannedResponseSearchKey}
          />
        ) : null}
        <ModalView
          showModal={showUndefinedVariablesModal}
          headerText={i18n.t('CONVERSATION.UNDEFINED_VARIABLES_TITLE')}
          contentText={undefinedVariableText}
          buttonText={i18n.t('CONVERSATION.UNDEFINED_VARIABLES_CLOSE')}
          onPressClose={() => setUndefinedVariablesModal(false)}
        />
        {isAnEmailChannelAndNotInPrivateNote() && emailFields && (
          <View style={styles.emailFields}>
            <View style={styles.emailFieldsTextWrap}>
              <Text medium sm color={colors.text} style={styles.emailFieldLabel}>
                {'Cc'}
              </Text>
              <TextInput
                style={styles.ccInputView}
                value={ccEmails}
                onChangeText={onCCMailChange}
                placeholder="Emails separated by commas"
                placeholderTextColor={colors.textLighter}
              />
            </View>
            <View style={styles.emailFieldsTextWrap}>
              <Text medium sm color={colors.text} style={styles.emailFieldLabel}>
                {'Bcc'}
              </Text>
              <TextInput
                style={styles.bccInputView}
                value={bccEmails}
                onChangeText={onBCCMailChange}
                placeholder="Emails separated by commas"
                placeholderTextColor={colors.textLighter}
              />
            </View>
          </View>
        )}

        <View style={[isPrivate ? styles.privateView : styles.replyView, inputBorderColor()]}>
          {isAnEmailChannelAndNotInPrivateNote() && !emailFields && (
            <Text
              medium
              sm
              color={colors.primaryColorDark}
              style={styles.emailFieldToggleButton}
              onPress={toggleCcBccInputs}>
              {'Cc/Bcc'}
            </Text>
          )}
          <MentionInput
            style={[styles.inputView, inputFieldColor()]}
            value={message}
            onChange={onNewMessageChange}
            partTypes={[
              {
                allowedSpacesCount: 0,
                isInsertSpaceAfterMention: true,
                trigger: '@',
                renderSuggestions,
                textStyle: { fontWeight: 'bold', color: 'white', backgroundColor: '#8c9eb6' },
              },
              {
                // eslint-disable-next-line no-useless-escape
                pattern: /\[([^\]]+)\]\(([^\)]+)\)/g,
                textStyle: { color: colors.primaryColor },
              },
            ]}
            multiline={true}
            placeholderTextColor={colors.textLighter}
            placeholder={
              isPrivate
                ? `${i18n.t('CONVERSATION.PRIVATE_MSG_INPUT')}`
                : `${i18n.t('CONVERSATION.TYPE_MESSAGE')}`
            }
            onBlur={onBlur}
            onFocus={onFocus}
          />

          <View style={styles.buttonViews}>
            <View style={styles.attachIconView}>
              <Attachment conversationId={conversationId} onSelectAttachment={onSelectAttachment} />
              <Pressable style={styles.privateNoteView} onPress={togglePrivateMode}>
                <Icon
                  icon="lock-closed-outline"
                  color={isPrivate ? colors.primaryColor : colors.textLight}
                  size={24}
                />
              </Pressable>
            </View>
            <Pressable
              style={[styles.sendButtonView, sendMessageButtonWrapStyles()]}
              disabled={!enableReplyBox}
              onPress={onNewMessageAdd}>
              <Icon
                icon="send-outline"
                style={styles.sendButton}
                color={enableReplyBox ? colors.primaryColor : colors.background}
                size={24}
              />
            </Pressable>
          </View>
        </View>
      </View>
    </React.Fragment>
  );
};

const createStyles = theme => {
  const { spacing, borderRadius, fontSize, colors } = theme;
  return StyleSheet.create({
    replyBoxContainer: {
      position: 'relative',
    },
    replyView: {
      paddingVertical: spacing.smaller,
      paddingHorizontal: spacing.small,
      backgroundColor: colors.background,
      borderTopColor: colors.borderLight,
    },
    privateView: {
      paddingVertical: spacing.smaller,
      paddingHorizontal: spacing.small,
      backgroundColor: colors.backgroundPrivateLight,
      borderTopColor: colors.borderLight,
      borderTopWidth: 1,
    },
    inputView: {
      fontSize: fontSize.sm,
      color: colors.textDarker,
      lineHeight: 18,
      borderRadius: borderRadius.small,
      paddingTop: !isAndroid ? spacing.half : spacing.smaller,
      paddingBottom: !isAndroid ? spacing.half : spacing.smaller,
      paddingHorizontal: 10,
      textAlign: 'left',
      maxHeight: 160,
    },
    emailFields: {
      paddingHorizontal: spacing.half,
      paddingVertical: spacing.micro,
      backgroundColor: colors.background,
    },
    emailFieldsTextWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing.tiny,
    },
    emailFieldLabel: {
      width: '8%',
    },
    emailFieldToggleButton: {
      position: 'absolute',
      backgroundColor: colors.backgroundLight,
      padding: spacing.micro,
      right: 24,
      top: 14,
      zIndex: 1,
    },
    ccInputView: {
      fontSize: fontSize.sm,
      color: colors.text,
      backgroundColor: colors.background,
      width: '92%',
      borderRadius: borderRadius.small,
      paddingHorizontal: 10,
      paddingVertical: spacing.smaller,
      textAlignVertical: 'top',
    },
    bccInputView: {
      backgroundColor: colors.background,
      width: '92%',
      borderRadius: borderRadius.small,
      fontSize: fontSize.sm,
      color: colors.text,
      paddingHorizontal: 10,
      paddingVertical: spacing.smaller,
      textAlignVertical: 'top',
    },
    buttonViews: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 6,
    },
    attachIconView: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'flex-end',
    },
    privateNoteView: {
      paddingLeft: spacing.half,
    },
    sendButtonView: {
      padding: spacing.smaller,
      borderRadius: borderRadius.largest,
    },
    lockButton: {
      paddingHorizontal: 0,
      paddingVertical: 0,
      justifyContent: 'flex-start',
    },
    sendButton: {
      padding: spacing.half,
    },
    overflowMenu: {
      padding: spacing.smaller,
      borderRadius: borderRadius.small,
      width: Dimensions.get('window').width / 1.5,
    },
    attachmentWrap: {
      height: 48,
    },
  });
};

ReplyBox.propTypes = propTypes;
export default ReplyBox;
