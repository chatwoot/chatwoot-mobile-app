import React, { useState } from 'react';
import { View, Image } from 'react-native';
import { withStyles } from '@ui-kitten/components';
import PropTypes from 'prop-types';
import LinearGradient from 'react-native-linear-gradient';

import { getUserInitial } from '../helpers';
import CustomText from './Text';

import ImageLoader from './ImageLoader';

import { INBOX_IMAGES } from '../constants';

const styles = (theme) => ({
  avatar: {
    alignSelf: 'center',
  },
  userThumbNail: {
    backgroundColor: 'color-primary-default',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    color: theme['color-basic-100'],
    fontWeight: theme['font-semi-bold'],
    fontSize: theme['font-size-small'],
  },
  imageLoader: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.7,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    alignSelf: 'flex-end',
  },
});

// eslint-disable-next-line react/prop-types
const Badge = ({ source, size, badgeStyle }) => {
  return (
    <Image
      style={[
        badgeStyle,
        {
          width: size / 4,
          height: size / 4,
          borderRadius: size / 4,
          bottom: size / 32,
          right: size / 32,
        },
      ]}
      source={source}
    />
  );
};

const UserAvatar = ({
  thumbnail,
  userName,
  size,
  fontSize = 20,
  defaultBGColor,
  channel,
  eva: { style },
}) => {
  const [imageLoading, onLoadImage] = useState(false);

  return thumbnail ? (
    <View>
      <Image
        source={{
          uri: thumbnail,
        }}
        style={
          ([style.image],
          {
            width: size,
            height: size,
            borderRadius: size,
          })
        }
        onLoadStart={() => onLoadImage(true)}
        onLoadEnd={() => onLoadImage(false)}
      />
      {INBOX_IMAGES[channel] && (
        <Badge source={INBOX_IMAGES[channel]} size={size} badgeStyle={style.badge} />
      )}

      {imageLoading && (
        <ImageLoader
          style={[
            style.imageLoader,
            {
              width: size,
              height: size,
              borderRadius: size,
            },
          ]}
        />
      )}
    </View>
  ) : (
    <View>
      <LinearGradient
        colors={['#04befe', '#4481eb']}
        style={[
          style.userThumbNail,
          {
            width: size,
            height: size,
            borderRadius: size,
          },
        ]}>
        <CustomText style={[style.userName, { fontSize: fontSize }]}>
          {getUserInitial({ userName })}
        </CustomText>
      </LinearGradient>
      {INBOX_IMAGES[channel] && (
        <Badge source={INBOX_IMAGES[channel]} size={size} badgeStyle={style.badge} />
      )}
    </View>
  );
};

const propTypes = {
  thumbnail: PropTypes.string,
  userName: PropTypes.string,
  size: PropTypes.number,
  fontSize: PropTypes.number,
  defaultBGColor: PropTypes.string,
  channel: PropTypes.string,
  eva: PropTypes.shape({
    style: PropTypes.object,
    theme: PropTypes.object,
  }).isRequired,
};

const defaultProps = {
  thumbnail: null,
  userName: null,
  size: 40,
};

UserAvatar.defaultProps = defaultProps;
UserAvatar.propTypes = propTypes;

UserAvatar.propTypes = propTypes;
export default withStyles(UserAvatar, styles);
