import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Image, Dimensions, SafeAreaView } from 'react-native';
import { Layout, TopNavigation, TopNavigationAction, withStyles } from '@ui-kitten/components';

import ImageZoom from 'react-native-image-pan-zoom';

import ImageLoader from '../../components/ImageLoader';
import Icon from '../../components/Icon';

const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

const styles = (theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme['background-basic-color-1'],
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  bannerImage: {
    height: deviceHeight,
    width: deviceWidth,
    resizeMode: 'contain',
  },
});

// eslint-disable-next-line react/prop-types
const BackIcon = ({ style: { tintColor } }) => {
  return <Icon name="close-outline" color={tintColor} />;
};
const propTypes = {
  eva: PropTypes.shape({
    style: PropTypes.object,
  }).isRequired,
  navigation: PropTypes.shape({
    goBack: PropTypes.func.isRequired,
  }).isRequired,

  route: PropTypes.shape({
    params: PropTypes.shape({
      imageUrl: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

const ImageScreen = ({ eva: { style: themedStyle }, navigation, route }) => {
  const [imageLoading, onLoadImage] = useState(false);

  const renderLeftControl = () => <TopNavigationAction onPress={onBackPress} icon={BackIcon} />;

  const onBackPress = () => {
    navigation.goBack();
  };

  const {
    params: { imageUrl },
  } = route;

  return (
    <SafeAreaView style={themedStyle.container}>
      <TopNavigation accessoryLeft={renderLeftControl} />
      <Layout style={themedStyle.imageContainer}>
        <ImageZoom
          cropWidth={Dimensions.get('window').width}
          cropHeight={Dimensions.get('window').height}
          imageWidth={Dimensions.get('window').width}
          imageHeight={Dimensions.get('window').height}>
          <Image
            style={themedStyle.bannerImage}
            source={{ uri: imageUrl }}
            onLoadStart={() => onLoadImage(true)}
            onLoadEnd={() => {
              onLoadImage(false);
            }}
          />
        </ImageZoom>
        {imageLoading && <ImageLoader style={themedStyle.imageLoader} />}
      </Layout>
    </SafeAreaView>
  );
};

ImageScreen.propTypes = propTypes;

export default withStyles(ImageScreen, styles);
