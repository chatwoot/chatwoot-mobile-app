import { useTheme } from '@react-navigation/native';
import { Icon, Pressable, Text } from 'components';
import ImageLoader from 'components/ImageLoader';
import { MESSAGE_STATUS } from 'constants';
import { differenceInHours } from 'date-fns';
import i18n from 'i18n';
import PropTypes from 'prop-types';
import React, { useMemo, useState } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import FastImage from 'react-native-fast-image';
const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

const createStyles = theme => {
  const { spacing, borderRadius, colors } = theme;
  return StyleSheet.create({
    fileView: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'flex-start',
      maxWidth: Dimensions.get('window').width - 40,
    },
    fileViewRight: {
      paddingTop: spacing.smaller,
      paddingBottom: spacing.smaller,
    },
    fileViewLeft: {
      paddingTop: spacing.smaller,
      paddingBottom: spacing.smaller,
    },
    imageViewLeft: {
      paddingTop: spacing.smaller,
      paddingBottom: spacing.smaller,
    },
    imageViewRight: {
      paddingTop: spacing.smaller,
      paddingBottom: spacing.smaller,
    },
    imageLoaderView: {
      paddingTop: spacing.larger,
      paddingBottom: spacing.larger,
    },
    privateMessageContainer: {
      paddingTop: spacing.smaller,
      paddingBottom: spacing.smaller,
    },
    imageLoader: {
      alignItems: 'center',
      borderRadius: borderRadius.small,
      borderTopLeftRadius: borderRadius.small,
      bottom: 0,
      justifyContent: 'center',
      left: 0,
      opacity: 0.7,
      position: 'absolute',
      right: 0,
      top: 0,
      paddingTop: spacing.smaller,
      paddingBottom: spacing.smaller,
    },
    image: {
      height: deviceHeight / 5,
      width: deviceWidth / 2,
      borderRadius: borderRadius.small,
      alignSelf: 'center',
    },
    fileAttachmentContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
    attachmentIconView: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingRight: spacing.smaller,
    },
    fileAttachmentView: {
      flexDirection: 'row',
    },
    attachmentTextView: {
      alignItems: 'flex-start',
      justifyContent: 'center',
      flexWrap: 'nowrap',
      flexGrow: 1,
      flex: 1,
    },
    filenameTextStyle: {
      textAlign: 'left',
    },
    downloadText: {
      textAlign: 'left',
      textDecorationLine: 'underline',
      paddingTop: spacing.tiny,
    },
    icon: {
      width: 16,
      height: 16,
    },
    instagramContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      height: 112,
      backgroundColor: colors.backgroundDark,
    },
  });
};

const propTypes = {
  type: PropTypes.string,
  showAttachment: PropTypes.func,
  message: PropTypes.shape({
    content: PropTypes.string,
    private: PropTypes.bool,
    status: PropTypes.string,
  }),
  attachments: PropTypes.arrayOf(
    PropTypes.shape({
      file_type: PropTypes.string,
      data_url: PropTypes.string,
    }),
  ),
};

function isMessageCreatedAtLessThan24HoursOld(messageTimestamp) {
  const currentTime = new Date();
  const messageTime = new Date(messageTimestamp * 1000);
  const hoursDifference = differenceInHours(currentTime, messageTime);

  return hoursDifference > 24;
}

const ChatAttachmentItemComponent = ({ type, attachments, showAttachment, message }) => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [imageLoading, onLoadImage] = useState(false);
  const isPrivate = message.private;
  const status = message.status;
  const { contentAttributes = {} } = message?.content_attributes || {};

  const createdAt = message.created_at;
  const { image_type = null, file_type = null } = contentAttributes;

  const isInstagramStory = image_type === 'story_mention';
  const isInstagramStoryExpired = isMessageCreatedAtLessThan24HoursOld(createdAt);

  const attachmentNameTextColor = () => {
    if (isPrivate) {
      return colors.textDark;
    }
    if (type === 'outgoing') {
      return colors.colorWhite;
    }
    return colors.textDark;
  };

  const attachmentDownloadTextColor = () => {
    if (isPrivate) {
      return colors.primaryColor;
    }
    if (type === 'outgoing') {
      return colors.colorWhite;
    }
    return colors.textDark;
  };

  const attachmentIconColor = () => {
    if (isPrivate) {
      return colors.primaryColor;
    }
    if (type === 'outgoing') {
      return colors.colorWhite;
    }
    return colors.primaryColor;
  };

  if (attachments && attachments.length > 0) {
    if (status === MESSAGE_STATUS.PROGRESS) {
      return (
        <TouchableOpacity style={styles.imageLoaderView}>
          <ImageLoader style={styles.imageLoader} />
        </TouchableOpacity>
      );
    }
    return attachments.map((attachment, index) => {
      const { file_type: fileType, data_url: dataUrl } = attachment;
      const fileName = dataUrl ? dataUrl.split('/').pop() : '';
      const fileNameWithOutExt = fileName.split('.').shift();
      const fileTypeFromName = fileName.split('.').pop();
      const fileNameToDisplay =
        fileName.length < 30
          ? `${fileName}`
          : `${fileNameWithOutExt.substr(fileName.length - 30)}...${fileTypeFromName}`;

      if (fileType === 'image') {
        return (
          <React.Fragment key={index}>
            {isInstagramStory && isInstagramStoryExpired ? (
              <View style={styles.instagramContainer}>
                <Icon icon="document-error-outline" size={24} color={colors.colorBlackLight} />
                <Text style={styles.text}>{i18n.t('CONVERSATION.STORY_NOT_AVAILABLE')}</Text>
              </View>
            ) : (
              <Pressable
                onPress={() => showAttachment({ type: 'image', dataUrl })}
                style={[
                  type === 'outgoing' ? styles.imageViewRight : styles.imageViewLeft,
                  isPrivate && styles.privateMessageContainer,
                ]}>
                <FastImage
                  style={styles.image}
                  source={{
                    uri: dataUrl,
                  }}
                  onLoadStart={() => onLoadImage(true)}
                  onLoadEnd={() => {
                    onLoadImage(false);
                  }}
                />
                {imageLoading && <ImageLoader style={styles.imageLoader} />}
              </Pressable>
            )}
          </React.Fragment>
        );
      }

      return (
        <View
          style={[
            type === 'outgoing' ? styles.fileViewRight : styles.fileViewLeft,
            styles.fileView,
          ]}
          key={index}>
          <View style={styles.fileAttachmentContainer}>
            <View style={styles.fileAttachmentView}>
              <View style={styles.attachmentIconView}>
                <Icon
                  icon={fileType === 'audio' ? 'headphone-filled' : 'file-filled'}
                  color={attachmentIconColor()}
                  size={24}
                />
              </View>
              <View style={styles.attachmentTextView}>
                <Text sm medium color={attachmentNameTextColor()} style={styles.filenameTextStyle}>
                  {fileNameToDisplay}
                </Text>
                <Pressable onPress={() => showAttachment({ type: 'file', dataUrl })}>
                  <Text xs color={attachmentDownloadTextColor()} style={styles.downloadText}>
                    {i18n.t('CONVERSATION.DOWNLOAD')}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      );
    });
  }
  return null;
};

ChatAttachmentItemComponent.propTypes = propTypes;
const ChatAttachmentItem = React.memo(ChatAttachmentItemComponent);
export default ChatAttachmentItem;
