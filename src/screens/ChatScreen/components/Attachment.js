import React, { createRef } from 'react';
import { Button, withStyles, Icon } from '@ui-kitten/components';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import ActionSheet from 'react-native-actions-sheet';
import PropTypes from 'prop-types';
import AttachmentActionItem from './AttachmentActionItem';

const PlusIcon = (style) => {
  return <Icon {...style} name="plus" />;
};

const styles = (theme) => ({
  button: {
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
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
const Attachment = ({ conversationId, eva: { style }, onSelectAttachment }) => {
  const actionSheetRef = createRef();
  const handleChoosePhoto = () => {
    actionSheetRef.current?.setModalVisible();
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
      <Button
        style={style.button}
        appearance="ghost"
        size="large"
        accessoryLeft={PlusIcon}
        onPress={handleChoosePhoto}
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
