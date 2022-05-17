import React, { useState } from 'react';
import { View, Dimensions } from 'react-native';
import { MentionInput } from 'react-native-controlled-mentions';
import { withStyles, Icon } from '@ui-kitten/components';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import AttachmentPreview from './AttachmentPreview';
import Attachment from './Attachment';
import i18n from 'i18n';
import { sendMessage, toggleTypingStatus } from 'actions/conversation';
import { findFileSize } from 'helpers/FileHelper';
import { MAXIMUM_FILE_UPLOAD_SIZE } from 'constants';
import { showToast } from 'helpers/ToastHelper';
import CannedResponses from './CannedResponses';
import MentionUser from './MentionUser.js';
import { captureEvent } from 'helpers/Analytics';
const propTypes = {
  conversationId: PropTypes.number,
  eva: PropTypes.shape({
    theme: PropTypes.object,
    style: PropTypes.object,
  }).isRequired,
  cannedResponses: PropTypes.array.isRequired,
};

const ReplyBox = ({ eva: { theme, style }, conversationId, cannedResponses }) => {
  const [isPrivate, setPrivateMode] = useState(false);
  const [message, setMessage] = useState('');
  const [isExpanded, setExpandedView] = useState(false);
  const agents = useSelector(state => state.agent.data);
  const verifiedAgents = agents.filter(agent => agent.confirmed);
  const [filteredCannedResponses, setFilteredCannedResponses] = useState([]);
  const [attachmentDetails, setAttachmentDetails] = useState(null);
  const dispatch = useDispatch();

  const onNewMessageChange = text => {
    setMessage(text);
    if (text.charAt(0) === '/') {
      const query = text.substring(1).toLowerCase();
      const responses = cannedResponses.filter(item => item.title.toLowerCase().includes(query));
      if (responses.length) {
        showCannedResponses({ responses });
      } else {
        hideCannedResponses();
      }
    } else {
      hideCannedResponses();
    }
  };
  const showCannedResponses = ({ responses }) => {
    setFilteredCannedResponses(responses);
  };

  const hideCannedResponses = () => {
    setFilteredCannedResponses([]);
  };

  const onBlur = () => {
    dispatch(toggleTypingStatus({ conversationId, typingStatus: 'off' }));
  };
  const onFocus = () => {
    dispatch(toggleTypingStatus({ conversationId, typingStatus: 'on' }));
  };

  const onCannedReponseSelect = content => {
    captureEvent({ eventName: 'Canned response selected' });
    setFilteredCannedResponses([]);
    setMessage(content);
  };

  const onSelectAttachment = ({ attachment }) => {
    captureEvent({ eventName: 'Attachment selected' });
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
    captureEvent({ eventName: 'Toggle private mode' });
    setPrivateMode(!isPrivate);
  };

  const onNewMessageAdd = () => {
    const updatedMessage = message.replace(
      /@\[([\w\d.-]+)\]\((\d+)\)/g,
      '[@$1](mention://user/$2/$1)',
    );
    if (message || attachmentDetails) {
      captureEvent({ eventName: 'Messaged sent' });
      dispatch(
        sendMessage({
          conversationId,
          message: updatedMessage,
          isPrivate,
          file: attachmentDetails,
        }),
      );

      setMessage('');
      setAttachmentDetails(null);
      setPrivateMode(false);
    }
  };

  const inputFieldHeight = () => (isExpanded ? { height: 450 } : { maxHeight: 150 });

  const inputFieldColor = () =>
    !isPrivate
      ? { backgroundColor: theme['color-background'] }
      : { backgroundColor: theme['color-background-private'] };

  const expandedInputButtonIcon = () => (isExpanded ? 'collapse-outline' : 'expand-outline');

  const onClickExpandReplyBox = () => {
    setExpandedView(!isExpanded);
  };

  const sendMessageButtonWrapStyles = () => {
    return !(!message && !attachmentDetails)
      ? { backgroundColor: theme['color-info-100'] }
      : { backgroundColor: theme['color-info-200'] };
  };

  // eslint-disable-next-line react/prop-types
  const renderSuggestions = ({ keyword, onSuggestionPress }) => {
    if (keyword == null || !isPrivate) {
      return null;
    }
    return (
      <View>
        {verifiedAgents
          // eslint-disable-next-line react/prop-types
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

  return (
    <React.Fragment>
      {attachmentDetails && (
        <AttachmentPreview
          attachmentDetails={attachmentDetails}
          onRemoveAttachment={onRemoveAttachment}
        />
      )}

      {filteredCannedResponses && (
        <CannedResponses
          cannedResponses={filteredCannedResponses}
          onCannedReponseSelect={onCannedReponseSelect}
        />
      )}
      <View style={isPrivate ? style.privateView : style.replyView}>
        <MentionInput
          style={[style.inputView, inputFieldHeight(), inputFieldColor()]}
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
          ]}
          multiline={true}
          placeholderTextColor={theme['text-basic-color']}
          placeholder={
            isPrivate
              ? `${i18n.t('CONVERSATION.PRIVATE_MSG_INPUT')}`
              : `${i18n.t('CONVERSATION.TYPE_MESSAGE')}`
          }
          onBlur={onBlur}
          onFocus={onFocus}
        />

        <View style={style.buttonViews}>
          <View style={style.attachIconView}>
            <Attachment conversationId={conversationId} onSelectAttachment={onSelectAttachment} />
            <View style={style.privateNoteView}>
              <Icon
                name="lock-outline"
                width={24}
                height={24}
                fill={isPrivate ? theme['color-primary-default'] : theme['text-hint-color']}
                onPress={togglePrivateMode}
              />
            </View>
            <View style={style.expandButton}>
              <Icon
                name={expandedInputButtonIcon()}
                width={24}
                height={24}
                fill={theme['text-hint-color']}
                onPress={onClickExpandReplyBox}
              />
            </View>
          </View>
          <View style={[style.sendButtonView, sendMessageButtonWrapStyles()]}>
            <Icon
              name="paper-plane"
              style={style.sendButton}
              width={24}
              height={24}
              fill={
                !(!message && !attachmentDetails)
                  ? theme['color-primary-default']
                  : theme['color-background']
              }
              onPress={onNewMessageAdd}
            />
          </View>
        </View>
      </View>
    </React.Fragment>
  );
};

const styles = theme => ({
  replyView: {
    padding: 8,
    paddingHorizontal: 14,
    backgroundColor: theme['background-basic-color-1'],
    borderTopColor: theme['color-border'],
    borderTopWidth: 1,
  },
  privateView: {
    padding: 8,
    paddingHorizontal: 14,
    backgroundColor: theme['color-background-private-light'],
    borderTopColor: theme['color-border'],
    borderTopWidth: 1,
  },
  inputView: {
    fontSize: theme['font-size-medium'],
    color: theme['text-basic-color'],
    borderRadius: 16,
    paddingTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 12,
    textAlignVertical: 'top',
    textAlign: 'left',
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
    paddingLeft: 10,
  },
  sendButtonView: {
    padding: 8,
    borderRadius: 30,
  },
  lockButton: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    justifyContent: 'flex-start',
  },
  sendButton: {
    padding: 12,
    transform: [{ rotate: '45deg' }],
    backgroundColor: 'transparent',
  },
  expandButton: {
    paddingLeft: 10,
  },
  overflowMenu: {
    padding: 8,
    borderRadius: 8,
    width: Dimensions.get('window').width / 1.5,
  },
});

ReplyBox.propTypes = propTypes;

const ReplyBoxItem = withStyles(ReplyBox, styles);
export default ReplyBoxItem;
