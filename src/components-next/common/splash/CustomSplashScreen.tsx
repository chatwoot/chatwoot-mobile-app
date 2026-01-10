import React from 'react';
import { View, StyleSheet, Image, StatusBar } from 'react-native';

const WHITE = '#FFFFFF';

export const CustomSplashScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={WHITE} barStyle="dark-content" />
      
      {/* Rounded Logo - WhatsApp style, clean and simple */}
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
  container: {
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
