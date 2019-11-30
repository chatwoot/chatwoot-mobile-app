import React, { Component } from 'react';
import { View, Text } from 'react-native';
import styles from './HomeScreen.style';

import i18n from '../../i18n';

class HomeScreen extends Component {
  render() {
    return (
      <View style={styles.mainView}>
        <Text>{i18n.t('WELCOME')} to Chatwoot</Text>
      </View>
    );
  }
}

export default HomeScreen;
