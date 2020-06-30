import React from 'react';
import PropTypes from 'prop-types';
import { BottomNavigation, BottomNavigationTab, withStyles, Icon } from '@ui-kitten/components';
// import { useSelector } from 'react-redux';

// import { View, Text } from 'react-native';

import i18n from '../i18n';

const ConversationIcon = (style) => <Icon {...style} name="message-circle" />;
const SettingsIcon = (style) => <Icon {...style} name="settings" />;
const NotificationIcon = (style) => <Icon {...style} name="bell" />;

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
  tabBadge: {
    position: 'absolute',
    top: 2,
    right: 168,
    backgroundColor: 'red',
    borderRadius: 16,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 1,
  },
  tabBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
}));
