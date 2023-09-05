import React, { useMemo, useRef, useCallback } from 'react';
import { useTheme } from '@react-navigation/native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { Icon, Pressable } from 'components';
import { Keyboard, StyleSheet, Dimensions, View } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import PropTypes from 'prop-types';

import BottomSheetModal from 'components/BottomSheet/BottomSheet';
import AttachmentActionItem from './AttachmentActionItem';

const deviceHeight = Dimensions.get('window').height;

const createStyles = theme => {
  const { spacing } = theme;
  return StyleSheet.create({
    button: {
      paddingHorizontal: 0,
      paddingVertical: 0,
      backgroundColor: 'transparent',
      flex: 1,
      alignSelf: 'flex-start',
      justifyContent: 'flex-start',
    },
    bottomSheetView: {
      flex: 1,
      paddingHorizontal: spacing.small,
    },
  });
};
const propTypes = {
  conversationId: PropTypes.number,
  onSelectAttachment: PropTypes.func,
};

const imagePickerOptions = {
  noData: true,
};
const Attachment = ({ conversationId, onSelectAttachment }) => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const handleChoosePhoto = () => {
    Keyboard.dismiss();
    setTimeout(() => {
      toggleAttachmentActionModal();
    }, 10);
  };
  const openCamera = () => {
    launchCamera(imagePickerOptions, response => {
      const attachment = response?.assets?.[0];
      if (!attachment) {
        return;
      }
      onSelectAttachment({ attachment });
    });
  };
  const openGallery = () => {
    launchImageLibrary(imagePickerOptions, response => {
      const attachment = response?.assets?.[0];
      if (!attachment) {
        return;
      }
      onSelectAttachment({ attachment });
    });
  };
  const openDocument = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [
          DocumentPicker.types.allFiles,
          DocumentPicker.types.images,
          DocumentPicker.types.plainText,
          DocumentPicker.types.audio,
          DocumentPicker.types.pdf,
          DocumentPicker.types.zip,
          DocumentPicker.types.csv,
          DocumentPicker.types.doc,
          DocumentPicker.types.docx,
          DocumentPicker.types.ppt,
          DocumentPicker.types.pptx,
          DocumentPicker.types.xls,
          DocumentPicker.types.xlsx,
        ],
      });
      const attachment = { uri: res.uri, type: res.type, fileSize: res.size, fileName: res.name };
      onSelectAttachment({ attachment });
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
      } else {
        throw err;
      }
    }
  };
  const onPressItem = ({ itemType }) => {
    closeAttachmentActionModal();
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

  const attachmentActionModal = useRef(null);
  const attachmentActionModalSnapPoints = useMemo(
    () => [deviceHeight - 620, deviceHeight - 620],
    [],
  );
  const toggleAttachmentActionModal = useCallback(() => {
    attachmentActionModal.current.present() || attachmentActionModal.current?.dismiss();
  }, []);
  const closeAttachmentActionModal = useCallback(() => {
    attachmentActionModal.current?.dismiss();
  }, []);

  return (
    <React.Fragment>
      <Pressable onPress={handleChoosePhoto}>
        <Icon icon="attach-outline" style={styles.sendButton} color={colors.textLight} size={24} />
      </Pressable>
      <BottomSheetModal
        bottomSheetModalRef={attachmentActionModal}
        initialSnapPoints={attachmentActionModalSnapPoints}
        closeFilter={closeAttachmentActionModal}
        children={
          <View style={styles.bottomSheetView}>
            <AttachmentActionItem
              text="Camera"
              iconName="camera-outline"
              itemType="upload_camera"
              onPressItem={onPressItem}
            />
            <AttachmentActionItem
              text="Photo Library"
              iconName="photo-outline"
              itemType="upload_gallery"
              onPressItem={onPressItem}
            />
            <AttachmentActionItem
              text="Document"
              iconName="file-outline"
              itemType="upload_file"
              onPressItem={onPressItem}
            />
          </View>
        }
      />
    </React.Fragment>
  );
};

Attachment.propTypes = propTypes;
export default Attachment;
