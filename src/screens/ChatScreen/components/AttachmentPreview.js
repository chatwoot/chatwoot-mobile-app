import React from 'react';
import { Image, View } from 'react-native';
import PropTypes from 'prop-types';
import { Icon, withStyles } from '@ui-kitten/components';
import CustomText from '../../../components/Text';
import { formatBytes, isTypeImage } from '../../../helpers/FileHelper';

const styles = theme => ({
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

const propTypes = {
  attachmentDetails: PropTypes.shape({
    uri: PropTypes.string,
    fileName: PropTypes.string,
    type: PropTypes.string,
    fileSize: PropTypes.number,
  }).isRequired,
  eva: PropTypes.shape({
    style: PropTypes.object,
    theme: PropTypes.object,
  }).isRequired,
  onRemoveAttachment: PropTypes.func,
};

const AttachmentPreview = ({ attachmentDetails, eva: { style, theme }, onRemoveAttachment }) => {
  const { uri, fileName, fileSize, type } = attachmentDetails;
  const formattedFileSize = formatBytes(fileSize, 0);
  return (
    <View style={style.preview}>
      {isTypeImage(type) ? (
        <Image
          style={style.image}
          source={{
            uri,
          }}
        />
      ) : (
        <Icon height={24} width={24} fill={theme['text-hint-color']} name="file-text" />
      )}

      <CustomText style={style.name}>
        {fileName.length < 36 ? `${fileName}` : `...${fileName.substr(fileName.length - 15)}`}
      </CustomText>
      <CustomText style={style.name}>{formattedFileSize}</CustomText>
      <Icon
        name="close-outline"
        height={24}
        width={24}
        fill={theme['text-hint-color']}
        onPress={onRemoveAttachment}
      />
    </View>
  );
};

AttachmentPreview.propTypes = propTypes;

export default withStyles(AttachmentPreview, styles);
