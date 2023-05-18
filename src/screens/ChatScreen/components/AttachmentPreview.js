import React, { useMemo } from 'react';
import { useTheme } from '@react-navigation/native';
import { Image, View, StyleSheet } from 'react-native';
import { Icon, Text, Pressable } from 'components';
import PropTypes from 'prop-types';
import { formatBytes, isTypeImage } from '../../../helpers/FileHelper';

const createStyles = theme => {
  return StyleSheet.create({
    preview: {
      flex: 1,
      flexDirection: 'row',
      paddingLeft: 16,
      paddingRight: 16,
      alignItems: 'center',
      backgroundColor: 'white',
      justifyContent: 'space-between',
    },
    name: {
      fontSize: theme['font-size-extra-medium'],
      fontWeight: theme['font-medium'],
    },
    image: {
      width: 32,
      height: 32,
      borderRadius: 4,
    },
  });
};

const propTypes = {
  attachmentDetails: PropTypes.shape({
    uri: PropTypes.string,
    fileName: PropTypes.string,
    type: PropTypes.string,
    fileSize: PropTypes.number,
  }).isRequired,
  onRemoveAttachment: PropTypes.func,
};

const AttachmentPreview = ({ attachmentDetails, onRemoveAttachment }) => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { uri, fileName, fileSize, type } = attachmentDetails;
  const formattedFileSize = formatBytes(fileSize, 0);
  return (
    <View style={styles.preview}>
      {isTypeImage(type) ? (
        <Image
          style={styles.image}
          source={{
            uri,
          }}
        />
      ) : (
        <Icon icon="file-filled" style={styles.sendButton} color={colors.textLight} size={20} />
      )}
      <Text sm medium color={colors.textDark} style={styles.name}>
        {fileName.length < 36 ? `${fileName}` : `...${fileName.substr(fileName.length - 15)}`}
      </Text>
      <Text sm medium color={colors.textDark} style={styles.name}>
        {formattedFileSize}
      </Text>
      <Pressable onPress={onRemoveAttachment}>
        <Icon icon="dismiss-outline" style={styles.sendButton} color={colors.textLight} size={18} />
      </Pressable>
    </View>
  );
};

AttachmentPreview.propTypes = propTypes;
export default AttachmentPreview;
