import React, { useState } from 'react';
import { View, Image } from 'react-native';
import { withStyles } from '@ui-kitten/components';
import PropTypes from 'prop-types';
import LinearGradient from 'react-native-linear-gradient';

import { getUserInitial } from '../helpers';
import CustomText from './Text';

import ImageLoader from './ImageLoader';

const styles = (theme) => ({
  avatar: {
    alignSelf: 'center',
  },
  userThumbNail: {
    width: 40,
    height: 40,
    borderRadius: 40,
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
    width: 40,
    height: 40,
    borderRadius: 40,
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const UserAvatar = ({ thumbnail, userName, size, defaultBGColor, eva: { style } }) => {
  const [imageLoading, onLoadImage] = useState(false);

  return thumbnail ? (
    <View>
      <Image
        source={{
          uri: thumbnail,
        }}
        style={style.image}
        onLoadStart={() => onLoadImage(true)}
        onLoadEnd={() => onLoadImage(false)}
      />
      {imageLoading && <ImageLoader style={style.imageLoader} />}
    </View>
  ) : (
    <LinearGradient colors={['#04befe', '#4481eb']} style={[style.userThumbNail]}>
      <CustomText style={style.userName}>{getUserInitial({ userName })}</CustomText>
    </LinearGradient>
  );
};

const propTypes = {
  thumbnail: PropTypes.string,
  userName: PropTypes.string,
  size: PropTypes.string,
  defaultBGColor: PropTypes.string,
  eva: PropTypes.shape({
    style: PropTypes.object,
    theme: PropTypes.object,
  }).isRequired,
};

const defaultProps = {
  thumbnail: null,
  userName: null,
  size: 'large',
};

UserAvatar.defaultProps = defaultProps;
UserAvatar.propTypes = propTypes;

UserAvatar.propTypes = propTypes;
export default withStyles(UserAvatar, styles);
