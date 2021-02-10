import React, { createRef } from 'react';
import { Button, withStyles, Icon } from '@ui-kitten/components';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useDispatch } from 'react-redux';
import ActionSheet from 'react-native-actions-sheet';
import PropTypes from 'prop-types';
import AttachmentActionItem from './AttachmentActionItem';
import { sendAttachement } from '../../../actions/conversation';

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
  conversationId: PropTypes.number,
};

const Attachment = ({ conversationId }) => {
  const dispatch = useDispatch();
  const actionSheetRef = createRef();
  const onPressItem = ({ itemType }) => {
    const options = {
      noData: true,
    };
    if (itemType === 'upload_camera') {
      launchCamera(options, (response) => {
        if (response.uri) {
        }
      });
    }
    if (itemType === 'upload_gallery') {
      launchImageLibrary(options, (response) => {
        actionSheetRef.current?.hide();
        if (response.uri) {
          let photo = { uri: response.uri };
          let formdata = new FormData();
          formdata.append('private', false);
          formdata.append('content', '');
          formdata.append('attachments[]', {
            uri: photo.uri,
            name: response.fileName,
            type: 'image/jpeg',
          });
          dispatch(sendAttachement({ conversationId, data: formdata }));
        }
      });
    }
  };
  const handleChoosePhoto = () => {
    actionSheetRef.current?.setModalVisible();
  };

  return (
    <React.Fragment>
      <Button
        style={styles.button}
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
