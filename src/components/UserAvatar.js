import React, { useState } from 'react';
import { View, Image } from 'react-native';
import { withStyles } from '@ui-kitten/components';
import PropTypes from 'prop-types';
import LinearGradient from 'react-native-linear-gradient';

import { getUserInitial } from '../helpers';
import CustomText from './Text';
import ImageLoader from './ImageLoader';
import { GRAVATAR_URL } from 'constants/url';

import { INBOX_IMAGES, PRESENCE_STATUS_COLORS } from '../constants';

const styles = theme => ({
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
  activeCircle: {
    borderColor: 'white',
    borderWidth: 2,
  },
});

const Badge = ({ source, size, badgeStyle, activeBadgeColor, activeCircle }) => {
  return source ? (
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
  ) : (
    <View
      style={[
        badgeStyle,
        activeCircle,
        {
          width: size / 4,
          height: size / 4,
          borderRadius: size / 4,
          bottom: size / 32,
          right: size / 32,

          backgroundColor: activeBadgeColor,
        },
      ]}
    />
  );
};

const UserAvatar = ({
  thumbnail,
  userName,
  size,
  fontSize,
  defaultBGColor,
  channel,
  availabilityStatus,
  eva: { style, theme },
}) => {
  const avatarUrl = thumbnail && !thumbnail.includes(GRAVATAR_URL) ? thumbnail : '';
  const [imageLoading, onLoadImage] = useState(false);
  const [imagePath, setImagePath] = useState(avatarUrl);
  return imagePath ? (
    <View>
      <Image
        source={{
          uri: imagePath,
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
        onError={() => {
          setImagePath(null);
        }}
      />

      {(PRESENCE_STATUS_COLORS[availabilityStatus] || INBOX_IMAGES[channel]) && (
        <Badge
          source={INBOX_IMAGES[channel] ? INBOX_IMAGES[channel] : null}
          size={size}
          badgeStyle={style.badge}
          activeBadgeColor={PRESENCE_STATUS_COLORS[availabilityStatus]}
          activeCircle={style.activeCircle}
        />
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
      {(PRESENCE_STATUS_COLORS[availabilityStatus] || INBOX_IMAGES[channel]) && (
        <Badge
          source={INBOX_IMAGES[channel] ? INBOX_IMAGES[channel] : null}
          size={size}
          badgeStyle={style.badge}
          activeBadgeColor={PRESENCE_STATUS_COLORS[availabilityStatus]}
          activeCircle={style.activeCircle}
        />
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
  availabilityStatus: PropTypes.string,
};

const badgePropTypes = {
  source: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  size: PropTypes.number,
  badgeStyle: PropTypes.object,
  activeBadgeColor: PropTypes.string,
  activeCircle: PropTypes.object,
};

const defaultProps = {
  thumbnail: null,
  userName: null,
  size: 48,
  fontSize: 20,
};

UserAvatar.defaultProps = defaultProps;
UserAvatar.propTypes = propTypes;
Badge.propTypes = badgePropTypes;

UserAvatar.propTypes = propTypes;
export default withStyles(UserAvatar, styles);
