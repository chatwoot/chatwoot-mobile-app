import React, { createRef } from 'react';
import { withStyles, Icon } from '@ui-kitten/components';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import ActionSheet from 'react-native-actions-sheet';
import { Keyboard } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import PropTypes from 'prop-types';

import AttachmentActionItem from './AttachmentActionItem';

const styles = theme => ({
  button: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    backgroundColor: 'transparent',
    flex: 1,
    alignSelf: 'flex-start',
    justifyContent: 'flex-start',
  },
});
const propTypes = {
  eva: PropTypes.shape({
    style: PropTypes.object,
    theme: PropTypes.object,
  }).isRequired,
  conversationId: PropTypes.number,
  onSelectAttachment: PropTypes.func,
};

const imagePickerOptions = {
  noData: true,
};
const Attachment = ({ conversationId, eva: { style, theme }, onSelectAttachment }) => {
  const actionSheetRef = createRef();
  const handleChoosePhoto = () => {
    Keyboard.dismiss();
    setTimeout(() => {
      actionSheetRef.current?.setModalVisible();
    }, 10);
  };
  const openCamera = () => {
    launchCamera(imagePickerOptions, response => {
      if (response.uri) {
        onSelectAttachment({ attachement: response });
      }
    });
  };
  const openGallery = () => {
    launchImageLibrary(imagePickerOptions, response => {
      if (response.uri) {
        onSelectAttachment({ attachement: response });
      }
    });
  };
  const openDocument = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [
          DocumentPicker.types.audio,
          DocumentPicker.types.pdf,
          DocumentPicker.types.plainText,
          DocumentPicker.types.doc,
          DocumentPicker.types.docx,
          DocumentPicker.types.xls,
          DocumentPicker.types.csv,
        ],
      });
      const attachement = { uri: res.uri, type: res.type, fileSize: res.size, fileName: res.name };
      onSelectAttachment({ attachement });
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
      } else {
        throw err;
      }
    }
  };
  const onPressItem = ({ itemType }) => {
    actionSheetRef.current?.hide();
    setTimeout(() => {
      if (itemType === 'upload_camera') {
        openCamera();
      }
      if (itemType === 'upload_gallery') {
        openGallery();
      }
      if (itemType === 'upload_file') {
        openDocument();
      }
    }, 500);
  };

  return (
    <React.Fragment>
      <Icon
        name="attach-outline"
        width={32}
        height={32}
        onPress={handleChoosePhoto}
        isAttachmentMode
        fill={theme['text-hint-color']}
      />
      <ActionSheet
        openAnimationSpeed={40}
        ref={actionSheetRef}
        gestureEnabled
        defaultOverlayOpacity={0.6}>
        <AttachmentActionItem
          text="Camera"
          iconName="camera-outline"
          itemType="upload_camera"
          onPressItem={onPressItem}
        />
        <AttachmentActionItem
          text="Photo Library"
          iconName="image-outline"
          itemType="upload_gallery"
          onPressItem={onPressItem}
        />
        <AttachmentActionItem
          text="Document"
          iconName="file-outline"
          itemType="upload_file"
          onPressItem={onPressItem}
        />
      </ActionSheet>
    </React.Fragment>
  );
};

Attachment.propTypes = propTypes;

const AttachmentItem = withStyles(Attachment, styles);
export default AttachmentItem;
