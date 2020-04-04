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
  imageView: {
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

  messageContent: {
    color: theme['text-active-color'],
    fontSize: theme['font-size-regular'],
    fontWeight: theme['font-regular'],
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

const MessageContentComponent = ({ themedStyle, message, type, showImage }) => {
  const [imageLoading, onLoadImage] = useState(false);
  const [visible, setVisible] = useState(false);

  const [senderDetails, setSender] = useState('');

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

  return (
    <React.Fragment>
      {message.content ? (
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
        <TouchableOpacity
          onPress={() => showImage({ imageUrl: message.attachment.data_url })}
          style={themedStyle.imageView}>
          <Image
            style={themedStyle.image}
            source={{
              uri: message.attachment.data_url,
            }}
            onLoadStart={() => onLoadImage(true)}
            onLoadEnd={() => {
              onLoadImage(false);
            }}
          />
          {imageLoading && <ImageLoader style={themedStyle.imageLoader} />}
        </TouchableOpacity>
      )}
    </React.Fragment>
  );
};

const MessageContent = withStyles(MessageContentComponent, styles);

const OutGoingMessageComponent = ({
  themedStyle,
  message,
  created_at,
  showImage,
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
        showImage={showImage}
      />
    </React.Fragment>
  );
};

const OutGoingMessage = withStyles(OutGoingMessageComponent, styles);

const IncomingMessageComponent = ({
  themedStyle,
  message,
  created_at,
  showImage,
}) => (
  <React.Fragment>
    <MessageContent
      message={message}
      created_at={created_at}
      type="incoming"
      showImage={showImage}
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
  showImage: PropTypes.func,
};

const defaultProps = {
  message: { content: null, date: null },
};

const ChatMessageComponent = ({ message, themedStyle, showImage }) => {
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
            showImage={showImage}
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
            showImage={showImage}
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
