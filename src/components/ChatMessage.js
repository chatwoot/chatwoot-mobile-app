/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { View, Dimensions, Image, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';

import { Icon, withStyles, Tooltip } from '@ui-kitten/components';

import CustomText from './Text';

import ImageLoader from './ImageLoader';
import { messageStamp } from '../helpers/TimeHelper';

const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

const styles = (theme) => ({
  message: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },

  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  messageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderBottomRightRadius: 8,
    borderTopRightRadius: 8,
    maxWidth: Dimensions.get('window').width - 120,
    left: -4,
    backgroundColor: theme['background-basic-color-1'],
    marginRight: 16,
  },

  imageViewLeft: {
    borderRadius: 8,
    borderTopRightRadius: 8,
    left: -4,
  },

  messageRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderBottomLeftRadius: 8,
    borderTopLeftRadius: 8,
    maxWidth: Dimensions.get('window').width - 120,
    left: 4,
    backgroundColor: theme['color-background-message'],
    marginLeft: 16,
  },
  imageViewRight: {
    borderRadius: 8,
    borderTopLeftRadius: 8,
    left: 4,
  },

  imageLoader: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.7,
    backgroundColor: theme['color-background-message'],
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
  activityView: {
    padding: 8,
    borderRadius: 8,
    maxWidth: Dimensions.get('window').width - 50,
    backgroundColor: theme['color-background-activity'],
  },
  activityDateView: {
    alignItems: 'flex-end',
  },

  messageActivity: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 16,
    height: 16,
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
  fileAttachmentView: {
    flexDirection: 'row',
  },
  attachmentTextView: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageContent: {
    color: theme['text-active-color'],
    fontSize: theme['font-size-regular'],
    fontWeight: theme['font-regular'],
  },

  filenameText: {
    color: theme['text-basic-color'],
    fontSize: theme['font-size-small'],
    fontWeight: theme['font-medium'],
    textAlign: 'left',
  },

  downloadText: {
    color: theme['color-primary-default'],
    paddingRight: 8,
    fontSize: theme['font-size-small'],
    fontWeight: theme['font-medium'],
    textAlign: 'left',
    alignSelf: 'stretch',
  },

  messageAttachment: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  date: {
    fontStyle: 'italic',
    color: theme['text-hint-color'],
    fontSize: theme['font-size-extra-extra-small'],
  },
});

const PersonIcon = (style) => {
  return <Icon {...style} name="person-outline" />;
};

const FileIcon = (style) => {
  return <Icon {...style} name="file-text-outline" width={32} height={32} />;
};

const MessageContentComponent = ({
  themedStyle,
  message,
  type,
  showAttachment,
  theme,
}) => {
  const [imageLoading, onLoadImage] = useState(false);
  const [visible, setVisible] = useState(false);

  const [senderDetails, setSender] = useState('');

  const { attachment } = message;

  const toggleTooltip = () => {
    setVisible(!visible);
    setSender('');
  };

  const showSender = () => {
    if (message.sender) {
      setVisible(!visible);
      setSender(`Sent by: ${message.sender.name}`);
    }
  };

  const renderAttachment = () => {
    const { file_type: fileType, data_url: dataUrl } = attachment;
    const fileName = dataUrl ? dataUrl.split('/').reverse()[0] : '';

    return (
      <React.Fragment>
        {fileType !== 'file' ? (
          <TouchableOpacity
            onPress={() => showAttachment({ type: 'image', dataUrl })}
            style={
              type === 'outgoing'
                ? themedStyle.imageViewRight
                : themedStyle.imageViewLeft
            }>
            <Image
              style={themedStyle.image}
              source={{
                uri: dataUrl,
              }}
              onLoadStart={() => onLoadImage(true)}
              onLoadEnd={() => {
                onLoadImage(false);
              }}
            />
            {imageLoading && <ImageLoader style={themedStyle.imageLoader} />}
          </TouchableOpacity>
        ) : (
          <View
            style={
              type === 'outgoing'
                ? themedStyle.messageRight
                : themedStyle.messageLeft
            }>
            <View style={themedStyle.fileAttachmentContainer}>
              <View style={themedStyle.fileAttachmentView}>
                <View style={themedStyle.attachmentIconView}>
                  <FileIcon
                    style={themedStyle.icon}
                    fill={theme['color-primary-default']}
                  />
                </View>
                <View style={themedStyle.attachmentTexView}>
                  <CustomText style={themedStyle.filenameText}>
                    {fileName.length < 30
                      ? `${fileName}`
                      : `...${fileName.substr(fileName.length - 15)}`}
                  </CustomText>

                  <TouchableOpacity
                    onPress={() => showAttachment({ type: 'file', dataUrl })}>
                    <CustomText style={themedStyle.downloadText}>
                      Download
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

  return (
    <React.Fragment>
      {!attachment ? (
        <TouchableOpacity
          style={
            type === 'outgoing'
              ? themedStyle.messageRight
              : themedStyle.messageLeft
          }
          activeOpacity={0.95}
          onPress={showSender}>
          <Tooltip
            text={senderDetails}
            placement="top start"
            visible={visible}
            onBackdropPress={toggleTooltip}>
            <CustomText style={themedStyle.messageContent}>
              {message.content}
            </CustomText>
          </Tooltip>
        </TouchableOpacity>
      ) : (
        renderAttachment()
      )}
    </React.Fragment>
  );
};

const MessageContent = withStyles(MessageContentComponent, styles);

const OutGoingMessageComponent = ({
  themedStyle,
  message,
  created_at,
  showAttachment,
}) => {
  return (
    <React.Fragment>
      <CustomText style={themedStyle.date}>
        {messageStamp({ time: created_at })}
      </CustomText>

      <MessageContent
        message={message}
        created_at={created_at}
        type="outgoing"
        showAttachment={showAttachment}
      />
    </React.Fragment>
  );
};

const OutGoingMessage = withStyles(OutGoingMessageComponent, styles);

const IncomingMessageComponent = ({
  themedStyle,
  message,
  created_at,

  showAttachment,
}) => (
  <React.Fragment>
    <MessageContent
      message={message}
      created_at={created_at}
      type="incoming"
      showAttachment={showAttachment}
    />
    <CustomText style={themedStyle.date}>
      {messageStamp({ time: created_at })}
    </CustomText>
  </React.Fragment>
);

const IncomingMessage = withStyles(IncomingMessageComponent, styles);

const ActivityMessageComponent = ({
  themedStyle,
  message,
  created_at,
  theme,
}) => (
  <View style={themedStyle.activityView}>
    <View style={themedStyle.activityDateView}>
      <CustomText style={themedStyle.date}>
        {messageStamp({ time: created_at })}
      </CustomText>
    </View>
    <View style={themedStyle.messageActivity}>
      <PersonIcon style={themedStyle.icon} fill={theme['text-hint-color']} />
      <CustomText style={themedStyle.messageContent}>
        {message.content}
      </CustomText>
    </View>
  </View>
);

const ActivityMessage = withStyles(ActivityMessageComponent, styles);

const propTypes = {
  message: PropTypes.shape({
    content: PropTypes.string,
    date: PropTypes.string,
  }),
  themedStyle: PropTypes.object,
  showAttachment: PropTypes.func,
};

const defaultProps = {
  message: { content: null, date: null },
};

const ChatMessageComponent = ({
  message,
  themedStyle,

  showAttachment,
}) => {
  const { message_type, created_at } = message;

  let alignment = message_type ? 'flex-end' : 'flex-start';
  if (message_type === 2) {
    alignment = 'center';
  }

  return (
    <View style={[themedStyle.message, { justifyContent: alignment }]}>
      <View style={themedStyle.messageContainer}>
        {alignment === 'flex-start' ? (
          <IncomingMessage
            message={message}
            created_at={created_at}
            type="incoming"
            showAttachment={showAttachment}
          />
        ) : alignment === 'center' ? (
          <ActivityMessage
            message={message}
            created_at={created_at}
            type="activity"
          />
        ) : (
          <OutGoingMessage
            message={message}
            created_at={created_at}
            type="outgoing"
            showAttachment={showAttachment}
          />
        )}
      </View>
    </View>
  );
};

const ChatMessage = withStyles(ChatMessageComponent, styles);

ChatMessage.defaultProps = defaultProps;
ChatMessage.propTypes = propTypes;

export default ChatMessage;
