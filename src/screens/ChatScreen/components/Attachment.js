import React, { createRef } from 'react';
import { withStyles, Icon } from '@ui-kitten/components';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import ActionSheet from 'react-native-actions-sheet';
import PropTypes from 'prop-types';
import AttachmentActionItem from './AttachmentActionItem';
import { Keyboard } from 'react-native';

const styles = (theme) => ({
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
    launchCamera(imagePickerOptions, (response) => {
      if (response.uri) {
        onSelectAttachment({ attachement: response });
      }
    });
  };
  const openGallery = () => {
    launchImageLibrary(imagePickerOptions, (response) => {
      if (response.uri) {
        onSelectAttachment({ attachement: response });
      }
    });
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
    }, 500);
  };

  return (
    <React.Fragment>
      <Icon
        name="attach-outline"
        width={24}
        height={24}
        onPress={handleChoosePhoto}
        isAttachmentMode
        fill={theme['text-hint-color']}
      />

      <ActionSheet ref={actionSheetRef} gestureEnabled defaultOverlayOpacity={0.3}>
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
      </ActionSheet>
    </React.Fragment>
  );
};

Attachment.propTypes = propTypes;

const AttachmentItem = withStyles(Attachment, styles);
export default AttachmentItem;
