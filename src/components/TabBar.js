import React from 'react';
import PropTypes from 'prop-types';
import { BottomNavigation, BottomNavigationTab, withStyles, Icon } from '@ui-kitten/components';
import { useSelector } from 'react-redux';

import { View, Text } from 'react-native';

import i18n from '../i18n';

const ConversationIcon = style => <Icon {...style} name="message-circle" />;
const SettingsIcon = style => <Icon {...style} name="settings" />;
const NotificationIcon = style => <Icon {...style} name="bell" />;

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
  const changeTab = index => {
    const selectedTabRoute = state.routes[index];
    navigation.navigate(selectedTabRoute.name);
  };

  const notification = useSelector(store => store.notification);

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
      <View style={style.badgeContainer(unReadCount)}>
        <View style={style.badgeWrapper(unReadCount)}>
          <View style={style.badgeView(unReadCount)}>
            {unReadCount ? (
              <Text style={style.badgeText(unReadCount)}>
                {unReadCount < 100 ? unReadCount : '99+'}
              </Text>
            ) : null}
          </View>
        </View>
      </View>
    </BottomNavigation>
  );
};

TabBarComponent.propTypes = propTypes;

export default withStyles(TabBarComponent, theme => ({
  tabBar: {
    borderTopWidth: 1,
    borderTopColor: theme['color-border'],
  },

  badgeContainer: unReadCount => ({
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  }),
  badgeWrapper: unReadCount => ({
    padding: 2,
    borderRadius: unReadCount > 10 ? 20 : 18,
    backgroundColor: theme['color-basic-100'],
    left: unReadCount > 99 ? 14 : 10,
  }),
  badgeView: unReadCount => ({
    borderRadius: unReadCount > 10 ? 20 : 18,
    minWidth: unReadCount > 10 ? 20 : 18,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
  }),
  badgeText: unReadCount => ({
    fontSize: theme['font-size-extra-small'],
    color: theme['color-basic-100'],
    paddingVertical: unReadCount > 10 ? 2 : 1,
    paddingHorizontal: unReadCount > 10 ? 2 : 1,
    textAlignVertical: 'center',
    textAlign: 'center',
    fontWeight: theme['font-semi-bold'],
  }),
}));
