import React from 'react';
import { SafeAreaView } from 'react-navigation';
import {
  BottomNavigation,
  BottomNavigationTab,
  Icon,
} from 'react-native-ui-kitten';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';

import i18n from '../i18n';

import { theme } from '../theme';

const HomeIcon = style => <Icon {...style} name="home-outline" />;

const SettingsIcon = style => <Icon {...style} name="settings-outline" />;

export default class TabBar extends React.Component {
  static propTypes = {
    navigation: PropTypes.shape({
      navigate: PropTypes.func.isRequired,
    }).isRequired,
  };

  changeTab = index => {
    const { navigation } = this.props;
    const selectedTabRoute = navigation.state.routes[index];
    navigation.navigate(selectedTabRoute.routeName);
  };

  render() {
    const {
      navigation: {
        state: { index: selectedIndex },
      },
    } = this.props;

    return (
      <SafeAreaView>
        <BottomNavigation
          selectedIndex={selectedIndex}
          onSelect={this.changeTab}
          appearance="noIndicator"
          style={styles.tabBar}>
          <BottomNavigationTab
            title={i18n.t('FOOTER.HOME')}
            icon={HomeIcon}
            titleStyle={!selectedIndex ? styles.tabActive : styles.tabNotActive}
          />
          <BottomNavigationTab
            title={i18n.t('FOOTER.SETTINGS')}
            icon={SettingsIcon}
            titleStyle={selectedIndex ? styles.tabActive : styles.tabNotActive}
          />
        </BottomNavigation>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 1,
    borderTopColor: theme['color-border-light'],
  },
  tabActive: {
    color: theme['color-primary'],
    fontFamily: theme['font-family-semi-bold'],
    fontSize: theme['font-size-extra-small'],
  },
  tabNotActive: {
    color: theme['text-primary-color'],
    fontFamily: theme['font-family-semi-bold'],
    fontSize: theme['font-size-extra-small'],
  },
});
