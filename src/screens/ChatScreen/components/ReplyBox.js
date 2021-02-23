import React, { useState } from 'react';
import { TextInput, View, Dimensions } from 'react-native';
import { withStyles, Icon } from '@ui-kitten/components';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import AttachmentPreview from './AttachmentPreview';
import Attachment from './Attachment';
import i18n from '../../../i18n';
import { sendMessage, toggleTypingStatus } from '../../../actions/conversation';
import { findFileSize } from '../../../helpers/FileHelper';
import { MAXIMUM_FILE_UPLOAD_SIZE } from '../../../constants';
import { showToast } from '../../../helpers/ToastHelper';
import CannedResponses from './CannedResponses';

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
  const [filteredCannedResponses, setFilteredCannedResponses] = useState([]);

  const [attachementDetails, setAttachmentDetails] = useState(null);
  const dispatch = useDispatch();

  const onNewMessageChange = (text) => {
    setMessage(text);

    if (text.charAt(0) === '/') {
      const query = text.substring(1).toLowerCase();
      const responses = cannedResponses.filter((item) => item.title.toLowerCase().includes(query));
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

  const onCannedReponseSelect = (content) => {
    setFilteredCannedResponses([]);
    setMessage(content);
  };

  const onSelectAttachment = ({ attachement }) => {
    const { fileSize } = attachement;
    if (findFileSize(fileSize) <= MAXIMUM_FILE_UPLOAD_SIZE) {
      setAttachmentDetails(attachement);
    } else {
      showToast({ message: i18n.t('CONVERSATION.FILE_SIZE_LIMIT_MESSAGE') });
    }
  };

  const onRemoveAttachment = () => {
    setAttachmentDetails(null);
  };

  const togglePrivateMode = () => {
    setPrivateMode(!isPrivate);
  };

  const onNewMessageAdd = () => {
    if (message || attachementDetails) {
      dispatch(
        sendMessage({
          conversationId,
          message,
          isPrivate,
          file: attachementDetails,
        }),
      );

      setMessage('');
      setAttachmentDetails(null);
      setPrivateMode(false);
    }
  };

  return (
    <React.Fragment>
      {attachementDetails && (
        <AttachmentPreview
          attachementDetails={attachementDetails}
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
        <View>
          <TextInput
            style={style.inputView}
            multiline={true}
            placeholderTextColor={theme['text-basic-color']}
            placeholder={
              isPrivate
                ? `${i18n.t('CONVERSATION.PRIVATE_MSG_INPUT')}`
                : `${i18n.t('CONVERSATION.TYPE_MESSAGE')}`
            }
            onBlur={onBlur}
            onFocus={onFocus}
            value={message}
            onChangeText={onNewMessageChange}
          />
        </View>
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
          </View>
          <View style={style.spacerView} />
          <View style={style.sendButtonView}>
            <Icon
              name="paper-plane"
              width={32}
              height={32}
              fill={
                !(!message && !attachementDetails)
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

const styles = (theme) => ({
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
    fontSize: theme['text-primary-size'],
    color: theme['text-basic-color'],
    paddingHorizontal: 8,
    paddingVertical: 8,
    maxHeight: 256,
    textAlignVertical: 'top',
  },
  buttonViews: {
    flexDirection: 'row',
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
  spacerView: {
    flexGrow: 2,
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
