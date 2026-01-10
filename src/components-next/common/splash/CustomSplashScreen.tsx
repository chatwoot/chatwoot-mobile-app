import React from 'react';
import { View, StyleSheet, Image, ImageBackground, StatusBar, Platform } from 'react-native';

const WHITE = '#FFFFFF';

export const CustomSplashScreen: React.FC = () => {
  // iOS: Full splash.png image (client requirement)
  // Android: Rounded logo on white background
  if (Platform.OS === 'ios') {
    return (
      <View style={styles.iosContainer}>
        <StatusBar barStyle="light-content" />
        <ImageBackground
          source={require('../../../../assets/splash.png')}
          style={styles.iosBackground}
          resizeMode="cover"
        />
      </View>
    );
  }

  // Android: Rounded logo on white background
  return (
    <View style={styles.androidContainer}>
      <StatusBar backgroundColor={WHITE} barStyle="dark-content" />
      <View style={styles.logoContainer}>
        <Image
          source={require('../../../../assets/AlooChat Android App Icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // iOS - Full screen splash image
  iosContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  iosBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  // Android - White background with rounded logo
  androidContainer: {
    flex: 1,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: 'hidden',
    backgroundColor: WHITE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
});
