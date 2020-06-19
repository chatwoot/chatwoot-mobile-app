import React, { useState } from 'react';
import { View, Image } from 'react-native';
import { useStyleSheet, StyleService } from '@ui-kitten/components';
import PropTypes from 'prop-types';
import { getRandomColor, getUserInitial } from '../helpers';
import CustomText from './Text';

import ImageLoader from './ImageLoader';

const themedStyles = StyleService.create({
  avatar: {
    alignSelf: 'center',
  },
  userThumbNail: {
    width: 56,
    height: 56,
    borderRadius: 56,
    backgroundColor: 'color-primary-default',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    color: 'text-control-color',
    fontWeight: 'font-bold',
    fontSize: 20,
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
    width: 56,
    height: 56,
    borderRadius: 56,
  },
  image: {
    width: 56,
    height: 56,
    borderRadius: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const UserAvatar = ({ thumbnail, userName, size, defaultBGColor }) => {
  const [imageLoading, onLoadImage] = useState(false);

  const styles = useStyleSheet(themedStyles);

  return thumbnail ? (
    <View>
      <Image
        source={{
          uri: thumbnail,
        }}
        style={styles.image}
        onLoadStart={() => onLoadImage(true)}
        onLoadEnd={() => onLoadImage(false)}
      />
      {imageLoading && <ImageLoader style={styles.imageLoader} />}
    </View>
  ) : (
    <View
      style={[
        styles.userThumbNail,
        {
          backgroundColor: defaultBGColor || getRandomColor({ userName }),
        },
      ]}>
      <CustomText style={styles.userName}>{getUserInitial({ userName })}</CustomText>
    </View>
  );
};

const propTypes = {
  thumbnail: PropTypes.string,
  userName: PropTypes.string,
  size: PropTypes.string,
  defaultBGColor: PropTypes.string,
};

const defaultProps = {
  thumbnail: null,
  userName: null,
  size: 'large',
};

UserAvatar.defaultProps = defaultProps;
UserAvatar.propTypes = propTypes;

export default UserAvatar;
