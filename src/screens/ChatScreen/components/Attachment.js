import React, { createRef, useMemo } from 'react';
import { useTheme } from '@react-navigation/native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { Icon, Pressable } from 'components';
import ActionSheet from 'react-native-actions-sheet';
import { Keyboard, StyleSheet } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import PropTypes from 'prop-types';

import AttachmentActionItem from './AttachmentActionItem';

const createStyles = theme => {
  return StyleSheet.create({
    button: {
      paddingHorizontal: 0,
      paddingVertical: 0,
      backgroundColor: 'transparent',
      flex: 1,
      alignSelf: 'flex-start',
      justifyContent: 'flex-start',
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
        onSelectAttachment({ attachment: response });
      }
    });
  };
  const openGallery = () => {
    launchImageLibrary(imagePickerOptions, response => {
      if (response.uri) {
        onSelectAttachment({ attachment: response });
      }
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
      <Pressable onPress={handleChoosePhoto}>
        <Icon icon="attach-outline" style={styles.sendButton} color={colors.textLight} size={24} />
      </Pressable>
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
      </ActionSheet>
    </React.Fragment>
  );
};

Attachment.propTypes = propTypes;
export default Attachment;
