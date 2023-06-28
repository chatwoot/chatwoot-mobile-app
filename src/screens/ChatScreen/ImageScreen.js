import React, { useMemo, useState } from 'react';
import { useTheme } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import PropTypes from 'prop-types';
import { View, Dimensions, SafeAreaView, StyleSheet } from 'react-native';
import ImageZoom from 'react-native-image-pan-zoom';
import { Header, ImageLoader } from 'components';

const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

const createStyles = theme => {
  const { colors } = theme;
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
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
      height: deviceHeight - 180,
      width: deviceWidth,
      resizeMode: 'contain',
    },
  });
};

const propTypes = {
  navigation: PropTypes.shape({
    goBack: PropTypes.func.isRequired,
  }).isRequired,

  route: PropTypes.shape({
    params: PropTypes.shape({
      imageUrl: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

const ImageScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [imageLoading, onLoadImage] = useState(false);

  const onBackPress = () => {
    navigation.goBack();
  };

  const {
    params: { imageUrl },
  } = route;

  return (
    <SafeAreaView style={styles.container}>
      <Header leftIcon="dismiss-outline" onPressLeft={onBackPress} />
      <View style={styles.imageContainer}>
        <ImageZoom
          cropWidth={Dimensions.get('window').width}
          cropHeight={Dimensions.get('window').height}
          imageWidth={Dimensions.get('window').width}
          imageHeight={Dimensions.get('window').height}>
          <FastImage
            style={styles.bannerImage}
            source={{
              uri: imageUrl,
            }}
            onLoadStart={() => onLoadImage(true)}
            onLoadEnd={() => {
              onLoadImage(false);
            }}
          />
        </ImageZoom>
        {imageLoading && <ImageLoader style={styles.imageLoader} />}
      </View>
    </SafeAreaView>
  );
};

ImageScreen.propTypes = propTypes;
export default ImageScreen;
