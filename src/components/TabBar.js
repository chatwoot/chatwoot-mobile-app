import React from 'react';
import PropTypes from 'prop-types';
import {
  BottomNavigation,
  BottomNavigationTab,
  Icon,
  withStyles,
} from '@ui-kitten/components';

import i18n from '../i18n';

const HomeIcon = style => <Icon {...style} name="home-outline" />;

const SettingsIcon = style => <Icon {...style} name="settings-outline" />;

class TabBarComponent extends React.Component {
  static propTypes = {
    themedStyle: PropTypes.object,
    theme: PropTypes.object,
    state: PropTypes.object,
    navigation: PropTypes.shape({
      navigate: PropTypes.func.isRequired,
    }).isRequired,
  };

  changeTab = index => {
    const { state, navigation } = this.props;
    const selectedTabRoute = state.routes[index];
    navigation.navigate(selectedTabRoute.name);
  };

  render() {
    const {
      state: { index: selectedIndex },
      themedStyle,
    } = this.props;

    return (
      <BottomNavigation
        selectedIndex={selectedIndex}
        onSelect={this.changeTab}
        appearance="noIndicator"
        style={themedStyle.tabBar}>
        <BottomNavigationTab
          title={i18n.t('FOOTER.HOME')}
          icon={HomeIcon}
          titleStyle={
            !selectedIndex ? themedStyle.tabActive : themedStyle.tabNotActive
          }
        />
        <BottomNavigationTab
          title={i18n.t('FOOTER.SETTINGS')}
          icon={SettingsIcon}
          titleStyle={
            selectedIndex ? themedStyle.tabActive : themedStyle.tabNotActive
          }
        />
      </BottomNavigation>
    );
  }
}

export default withStyles(TabBarComponent, theme => ({
  tabBar: {
    borderTopWidth: 1,
    borderTopColor: theme['color-border'],
  },
  tabActive: {
    fontWeight: theme['font-semi-bold'],
    fontSize: theme['font-size-extra-small'],
  },
  tabNotActive: {
    fontWeight: theme['font-semi-bold'],
    fontSize: theme['font-size-extra-small'],
  },
}));
