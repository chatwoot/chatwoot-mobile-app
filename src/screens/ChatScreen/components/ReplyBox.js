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

  const onSelectAttachment = ({ attachement }) => {
    captureEvent({ eventName: 'Attachement selected' });
    const { fileSize } = attachement;
    if (findFileSize(fileSize) <= MAXIMUM_FILE_UPLOAD_SIZE) {
      setAttachmentDetails(attachement);
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
          style={style.inputView}
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
                width={32}
                height={32}
                fill={isPrivate ? theme['color-primary-default'] : theme['text-hint-color']}
                onPress={togglePrivateMode}
              />
            </View>
          </View>
          <View style={style.sendButtonView}>
            <Icon
              name="paper-plane"
              width={32}
              height={32}
              fill={
                !(!message && !attachmentDetails)
                  ? theme['color-primary-default']
                  : theme['text-hint-color']
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
    backgroundColor: theme['background-basic-color-1'],
    borderTopColor: theme['color-border'],
    borderTopWidth: 1,
  },
  privateView: {
    padding: 8,
    backgroundColor: theme['color-background-private'],
    borderTopColor: theme['color-border'],
    borderTopWidth: 1,
  },
  inputView: {
    fontSize: theme['font-size-medium'],
    color: theme['text-basic-color'],
    paddingHorizontal: 8,
    paddingVertical: 16,
    textAlignVertical: 'top',
  },
  buttonViews: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  attachIconView: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  privateNoteView: {
    paddingLeft: 8,
  },
  sendButtonView: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  lockButton: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    justifyContent: 'flex-start',
  },
  sendButton: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    backgroundColor: 'transparent',
    alignItems: 'flex-end',
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
