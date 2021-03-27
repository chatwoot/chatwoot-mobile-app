import React, { useState } from 'react';
import { TouchableOpacity, View, Dimensions, Image } from 'react-native';
import PropTypes from 'prop-types';
import { withStyles, Icon } from '@ui-kitten/components';

const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

import ImageLoader from 'components/ImageLoader';
import CustomText from 'components/Text';
import i18n from 'i18n';

const styles = (theme) => ({
  fileViewRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomLeftRadius: 8,
    borderTopLeftRadius: 8,
    maxWidth: Dimensions.get('window').width - 120,
    backgroundColor: theme['color-primary-default'],
    elevation: 1,
  },

  fileViewLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomRightRadius: 8,
    borderTopRightRadius: 8,
    maxWidth: Dimensions.get('window').width - 120,
    backgroundColor: theme['background-basic-color-1'],
    elevation: 1,
  },
  imageViewLeft: {
    borderRadius: 8,
    borderTopRightRadius: 8,
    left: -4,
    backgroundColor: theme['color-primary-default'],
    padding: 2,
  },

  imageViewRight: {
    borderRadius: 8,
    borderTopLeftRadius: 8,
    left: 4,
    padding: 2,
    backgroundColor: theme['color-primary-default'],
  },
  privateMessageContainer: {
    backgroundColor: theme['color-background-activity'],
    color: theme['text-basic-color'],
    borderWidth: 1,
    borderColor: theme['color-border-activity'],
    paddingTop: 8,
  },
  imageLoader: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.7,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderTopLeftRadius: 8,
  },

  image: {
    height: deviceHeight / 5,
    width: deviceWidth / 2,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    alignSelf: 'center',
  },
  fileAttachmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachmentIconView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  attachmentTexView: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  fileAttachmentView: {
    flexDirection: 'row',
  },
  attachmentTextView: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  filenameRightText: {
    color: theme['color-basic-100'],
    fontSize: theme['font-size-small'],
    fontWeight: theme['font-medium'],
    textAlign: 'left',
  },

  filenameLeftText: {
    color: theme['color-message-left'],
    fontSize: theme['font-size-small'],
    fontWeight: theme['font-medium'],
    textAlign: 'left',
  },

  downloadRightText: {
    color: theme['color-background-message'],
    fontSize: theme['font-size-extra-small'],
    fontWeight: theme['font-medium'],
    textAlign: 'left',
    alignSelf: 'stretch',
  },
  downloadLeftText: {
    color: '#005fb8',
    fontSize: theme['font-size-extra-small'],
    fontWeight: theme['font-medium'],
    textAlign: 'left',
    alignSelf: 'stretch',
  },
  attachmentText: {
    fontSize: theme['text-primary-size'],
    fontWeight: theme['font-medium'],
    color: 'white',
    paddingBottom: 4,
    paddingLeft: 8,
  },
  attachmentPrivateText: {
    fontSize: theme['text-primary-size'],
    fontWeight: theme['font-medium'],
    color: theme['text-basic-color'],
    paddingBottom: 4,
    paddingLeft: 8,
  },
});

const propTypes = {
  eva: PropTypes.shape({
    style: PropTypes.object,
    theme: PropTypes.object,
  }).isRequired,
  type: PropTypes.string,
  showAttachment: PropTypes.func,
  message: PropTypes.shape({
    content: PropTypes.string,
    private: PropTypes.bool,
    attachments: PropTypes.arrayOf(
      PropTypes.shape({
        file_type: PropTypes.string,
        data_url: PropTypes.string,
      }),
    ),
  }),
};

const FileIcon = (style) => {
  return <Icon {...style} name="file-text-outline" width={32} height={32} />;
};

const ChatAttachmentItemComponent = ({ type, showAttachment, message, eva: { style, theme } }) => {
  const { attachments, content } = message;

  const [imageLoading, onLoadImage] = useState(false);

  const { file_type: fileType, data_url: dataUrl } = attachments[0];
  const fileName = dataUrl ? dataUrl.split('/').reverse()[0] : '';
  return (
    <React.Fragment>
      {fileType === 'image' ? (
        <TouchableOpacity
          onPress={() => showAttachment({ type: 'image', dataUrl })}
          style={[
            type === 'outgoing' ? style.imageViewRight : style.imageViewLeft,
            message.private && style.privateMessageContainer,
          ]}>
          {content !== '' && (
            <CustomText
              style={message.private ? style.attachmentPrivateText : style.attachmentText}>
              {content}
            </CustomText>
          )}
          <Image
            style={style.image}
            source={{
              uri: dataUrl,
            }}
            onLoadStart={() => onLoadImage(true)}
            onLoadEnd={() => {
              onLoadImage(false);
            }}
          />

          {imageLoading && <ImageLoader style={style.imageLoader} />}
        </TouchableOpacity>
      ) : (
        <View style={type === 'outgoing' ? style.fileViewRight : style.fileViewLeft}>
          <View style={style.fileAttachmentContainer}>
            <View style={style.fileAttachmentView}>
              <View style={style.attachmentIconView}>
                <FileIcon
                  fill={
                    type === 'outgoing' ? theme['color-basic-100'] : theme['color-primary-default']
                  }
                />
              </View>
              <View style={style.attachmentTexView}>
                <CustomText
                  style={type === 'outgoing' ? style.filenameRightText : style.filenameLeftText}>
                  {fileName.length < 25
                    ? `${fileName}`
                    : `...${fileName.substr(fileName.length - 15)}`}
                </CustomText>
                <TouchableOpacity onPress={() => showAttachment({ type: 'file', dataUrl })}>
                  <CustomText
                    style={type === 'outgoing' ? style.downloadRightText : style.downloadLeftText}>
                    {i18n.t('CONVERSATION.DOWNLOAD')}
                  </CustomText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      )}
    </React.Fragment>
  );
};

ChatAttachmentItemComponent.propTypes = propTypes;

const ChatAttachmentItem = withStyles(ChatAttachmentItemComponent, styles);
export default ChatAttachmentItem;
