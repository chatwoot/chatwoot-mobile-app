import React, { useState } from 'react';
import { Button, withStyles, Icon, OverflowMenu, MenuItem } from '@ui-kitten/components';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { Dimensions, TextInput, View } from 'react-native';
import AttachmentPreview from './AttachmentPreview';
import Attachment from './Attachment';
import i18n from '../../../i18n';
import { sendMessage, toggleTypingStatus } from '../../../actions/conversation';
import { findFileSize } from '../../../helpers/FileHelper';
import { MAXIMUM_FILE_UPLOAD_SIZE } from '../../../constants';
import { showToast } from '../../../helpers/ToastHelper';

const renderAnchor = () => <View />;

const PaperPlaneIconFill = (style) => {
  return <Icon {...style} name="paper-plane" />;
};

const propTypes = {
  conversationId: PropTypes.number,
  eva: PropTypes.shape({
    theme: PropTypes.object,
    style: PropTypes.object,
  }).isRequired,
  cannedResponses: PropTypes.array.isRequired,
};

const ReplyBox = ({ conversationId, eva: { theme, style }, cannedResponses }) => {
  const [message, setMessage] = useState('');
  const [filteredCannedResponses, setFilteredCannedResponses] = useState([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
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
    setMenuVisible(true);
    setSelectedIndex(null);
    setFilteredCannedResponses(responses);
  };

  const hideCannedResponses = () => {
    setMenuVisible(false);
    setSelectedIndex(null);
    setFilteredCannedResponses([]);
  };

  const toggleOverFlowMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const onNewMessageAdd = () => {
    if (message || attachementDetails) {
      dispatch(
        sendMessage({
          conversationId,
          message,
          isPrivate: false,
          file: attachementDetails,
        }),
      );

      setMessage('');
      setAttachmentDetails(null);
    }
  };
  const onBlur = () => {
    dispatch(toggleTypingStatus({ conversationId, typingStatus: 'off' }));
  };
  const onFocus = () => {
    dispatch(toggleTypingStatus({ conversationId, typingStatus: 'on' }));
  };

  const onItemSelect = (itemSelected) => {
    const indexSelected = itemSelected.row;
    const selectedItem = filteredCannedResponses[indexSelected];
    const { content } = selectedItem;
    setMenuVisible(false);
    setSelectedIndex(indexSelected);
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

  return (
    <React.Fragment>
      {attachementDetails && (
        <AttachmentPreview
          attachementDetails={attachementDetails}
          onRemoveAttachment={onRemoveAttachment}
        />
      )}
      <View style={style.inputView}>
        <Attachment conversationId={conversationId} onSelectAttachment={onSelectAttachment} />
        <TextInput
          style={style.input}
          placeholder={`${i18n.t('CONVERSATION.TYPE_MESSAGE')}...`}
          onBlur={onBlur}
          onFocus={onFocus}
          value={message}
          placeholderTextColor={theme['text-basic-color']}
          onChangeText={onNewMessageChange}
        />

        {filteredCannedResponses && (
          <OverflowMenu
            anchor={renderAnchor}
            data={filteredCannedResponses}
            visible={menuVisible}
            selectedIndex={selectedIndex}
            onSelect={onItemSelect}
            placement="top"
            style={style.overflowMenu}
            backdropStyle={style.backdrop}
            onBackdropPress={toggleOverFlowMenu}>
            {filteredCannedResponses.map((item) => (
              <MenuItem title={item.title} key={item.id} />
            ))}
          </OverflowMenu>
        )}

        <Button
          style={style.addMessageButton}
          appearance="ghost"
          size="large"
          accessoryLeft={PaperPlaneIconFill}
          onPress={onNewMessageAdd}
          disabled={!message && !attachementDetails}
        />
      </View>
    </React.Fragment>
  );
};

ReplyBox.propTypes = propTypes;

const styles = (theme) => ({
  inputView: {
    flex: 1,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme['background-basic-color-1'],
  },
  input: {
    flex: 1,
    fontSize: theme['text-primary-size'],
    color: theme['text-basic-color'],
    paddingTop: 4,
    paddingLeft: 4,
    paddingRight: 4,
    paddingBottom: 4,
    height: 48,
  },
  addMessageButton: {
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
  },
  backdrop: {
    backgroundColor: theme['back-drop-color'],
  },
  overflowMenu: {
    padding: 8,
    borderRadius: 8,
    width: Dimensions.get('window').width / 1.5,
  },
});

const ReplyBoxItem = withStyles(ReplyBox, styles);
export default ReplyBoxItem;
