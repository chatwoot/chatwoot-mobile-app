import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Image, Dimensions, SafeAreaView } from 'react-native';
import {
  Layout,
  TopNavigation,
  Icon,
  TopNavigationAction,
  withStyles,
} from '@ui-kitten/components';

import ImageZoom from 'react-native-image-pan-zoom';

import ImageLoader from '../../components/ImageLoader';

const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

const styles = (theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme['background-basic-color-1'],
  },
  imageContainer: {
    flex: 1,
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

const BackIcon = (style) => <Icon {...style} name="close-outline" />;

const BackAction = (props) => <TopNavigationAction {...props} icon={BackIcon} />;

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
  const {
    params: { imageUrl },
  } = route;

  return (
    <SafeAreaView style={themedStyle.container}>
      <TopNavigation leftControl={<BackAction onPress={navigation.goBack} />} />
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
