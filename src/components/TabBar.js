import React from 'react';
import PropTypes from 'prop-types';
import { BottomNavigation, BottomNavigationTab, withStyles, Icon } from '@ui-kitten/components';

import i18n from '../i18n';

const ConversationIcon = (style) => <Icon {...style} name="message-circle-outline" />;
const SettingsIcon = (style) => <Icon {...style} name="settings-outline" />;
const NotificationIcon = (style) => <Icon {...style} name="bell-outline" />;

const propTypes = {
  eva: PropTypes.shape({
    style: PropTypes.object,
  }).isRequired,
  state: PropTypes.object.isRequired,
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};

const TabBarComponent = ({ eva, navigation, state }) => {
  const changeTab = (index) => {
    const selectedTabRoute = state.routes[index];
    navigation.navigate(selectedTabRoute.name);
  };

  const { style } = eva;
  const { index: selectedIndex } = state;
  return (
    <BottomNavigation
      selectedIndex={selectedIndex}
      onSelect={changeTab}
      appearance="noIndicator"
      style={style.tabBar}>
      <BottomNavigationTab title={i18n.t('FOOTER.CONVERSATION')} icon={ConversationIcon} />
      <BottomNavigationTab title={i18n.t('FOOTER.NOTIFICATION')} icon={NotificationIcon} />
      <BottomNavigationTab title={i18n.t('FOOTER.SETTINGS')} icon={SettingsIcon} />
    </BottomNavigation>
  );
};

TabBarComponent.propTypes = propTypes;

export default withStyles(TabBarComponent, (theme) => ({
  tabBar: {
    borderTopWidth: 1,
    borderTopColor: theme['color-border'],
  },
}));
