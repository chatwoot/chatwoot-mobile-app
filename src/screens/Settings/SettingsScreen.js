import React, { Component } from 'react';
import { Layout, TopNavigation } from 'react-native-ui-kitten';

import { StyleSheet } from 'react-native';

import { theme } from '../../theme';
import i18n from '../../i18n';

class Settings extends Component {
  render() {
    return (
      <Layout style={styles.container}>
        <TopNavigation
          title={i18n.t('SETTINGS.HEADER_TITLE')}
          titleStyle={styles.headerTitle}
        />
      </Layout>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerTitle: {
    color: theme['header-text-color'],
    fontFamily: theme['font-family-semi-bold'],
    fontSize: theme['font-size-large'],
  },
});

export default Settings;
