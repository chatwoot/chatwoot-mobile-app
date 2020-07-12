import React from 'react';
import PropTypes from 'prop-types';
import { BottomNavigation, BottomNavigationTab, withStyles, Icon } from '@ui-kitten/components';
import { useSelector } from 'react-redux';

import { Platform, Dimensions } from 'react-native';

import { View, Text } from 'react-native';

import i18n from '../i18n';

const { height } = Dimensions.get('window');

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

  const notification = useSelector((store) => store.notification);

  const {
    data: {
      meta: { unread_count: unReadCount },
    },
  } = notification;
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
      <View style={style.badgeContainer}>
        <View style={style.badgeWrapper}>
          <View style={style.badgeView}>
            {unReadCount ? (
              <Text style={style.badgeText}>{unReadCount < 100 ? '1' : '99+'}</Text>
            ) : null}
          </View>
        </View>
      </View>
    </BottomNavigation>
  );
};

TabBarComponent.propTypes = propTypes;

export default withStyles(TabBarComponent, (theme) => ({
  tabBar: {
    borderTopWidth: 1,
    borderTopColor: theme['color-border'],
    paddingBottom: Platform.OS === 'ios' && height >= 812 ? 12 : 0,
  },

  badgeContainer: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  badgeWrapper: {
    padding: 2,
    borderRadius: 18,
    backgroundColor: theme['color-basic-100'],
    left: 10,
  },
  badgeView: {
    borderRadius: 18,
    minWidth: 18,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: theme['font-size-extra-small'],
    color: theme['color-basic-100'],
    paddingVertical: 2,
    paddingHorizontal: 2,
    textAlignVertical: 'center',
    textAlign: 'center',
    fontWeight: theme['font-semi-bold'],
  },
}));
