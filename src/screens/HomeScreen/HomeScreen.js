import React, { Component } from 'react';
import { View, Text } from 'react-native';
import styles from './HomeScreen.style';

class HomeScreen extends Component {
  render() {
    return (
      <View style={styles.mainView}>
        <Text>Chatwoot</Text>
      </View>
    );
  }
}

export default HomeScreen;
