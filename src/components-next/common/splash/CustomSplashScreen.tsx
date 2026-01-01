import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AlooLogo } from '@/svg-icons/AlooLogo';

export const CustomSplashScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <AlooLogo width={240} height={43} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
