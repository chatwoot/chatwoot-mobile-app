import React, { Fragment } from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';
import { withStyles, Icon } from '@ui-kitten/components';

import CustomText from 'components/Text';
import i18n from 'i18n';

const styles = theme => ({
  imageView: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewIcon: {
    width: 16,
    height: 16,
    marginTop: 4,
    color: 'black',
  },
  messageActive: {
    fontSize: theme['text-primary-size'],
    fontWeight: theme['font-medium'],
    paddingTop: 4,
  },
  messageNotActive: {
    fontSize: theme['text-primary-size'],
    paddingTop: 4,
  },
});

const propTypes = {
  eva: PropTypes.shape({
    style: PropTypes.object,
    theme: PropTypes.object,
  }).isRequired,
  type: PropTypes.string,
  unReadCount: PropTypes.number,
  showAttachment: PropTypes.func,
  attachment: PropTypes.object,
};

const ImagePreviewIcon = style => {
  return <Icon {...style} name="image" />;
};

const FilePreviewIcon = style => {
  return <Icon {...style} name="file-text" />;
};

const ConversationAttachmentItemComponent = ({ eva, unReadCount, attachment }) => {
  const { file_type: fileType } = attachment;
  const { style, theme } = eva;
  return (
    <Fragment>
      {fileType === 'image' ? (
        <View style={style.imageView}>
          <ImagePreviewIcon style={style.previewIcon} fill={theme['text-hint-color']} />
          <CustomText
            style={unReadCount ? style.messageActive : style.messageNotActive}
            numberOfLines={1}
            maxLength={8}>
            {i18n.t('CONVERSATION.PICTURE_CONTENT')}
          </CustomText>
        </View>
      ) : (
        <View style={style.imageView}>
          <FilePreviewIcon style={style.previewIcon} fill={theme['text-hint-color']} />
          <CustomText
            style={unReadCount ? style.messageActive : style.messageNotActive}
            numberOfLines={1}
            maxLength={8}>
            {i18n.t('CONVERSATION.ATTACHMENT_CONTENT')}
          </CustomText>
        </View>
      )}
    </Fragment>
  );
};

ConversationAttachmentItemComponent.propTypes = propTypes;

const ConversationAttachmentItem = withStyles(ConversationAttachmentItemComponent, styles);
export default ConversationAttachmentItem;
