import React, { useMemo, useState } from 'react';
import { useTheme } from '@react-navigation/native';
import ImageZoom from 'react-native-image-pan-zoom';
import FastImage from 'react-native-fast-image';
import PropTypes from 'prop-types';
import { View, SafeAreaView, StyleSheet, Dimensions } from 'react-native';
import { Header, ImageLoader } from 'components';

const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height - 180;

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
      flex: 1,
    },
    bannerImage: {
      flex: 1,
      width: '100%',
      height: '100%',
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
        {imageLoading && <ImageLoader style={styles.imageLoader} />}
        <ImageZoom
          cropWidth={deviceWidth}
          cropHeight={deviceHeight}
          imageWidth={deviceWidth}
          imageHeight={deviceHeight}>
          <FastImage
            style={styles.bannerImage}
            source={{
              uri: imageUrl,
            }}
            onLoadStart={() => onLoadImage(true)}
            onLoadEnd={() => {
              onLoadImage(false);
            }}
            resizeMode={FastImage.resizeMode.contain}
          />
        </ImageZoom>
      </View>
    </SafeAreaView>
  );
};

ImageScreen.propTypes = propTypes;
export default ImageScreen;
