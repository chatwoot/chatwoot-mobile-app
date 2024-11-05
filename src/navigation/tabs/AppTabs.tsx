import React, { useMemo, useEffect, Fragment } from 'react';
import { useSelector } from 'react-redux';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { Icon } from 'components';
import { selectUnreadCount } from 'reducer/notificationSlice';
import { authActions } from '@/store/auth/authActions';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { selectLoggedIn, selectUser } from '@/store/auth/authSelectors';

import { getUserPermissions } from 'helpers/permissionHelper';
import { CONVERSATION_PERMISSIONS } from 'constants/permissions';

import { AuthStack, ConversationStack, NotificationStack, SettingsStack } from '../stack';
import ChatScreen from '@/screens/ChatScreen/ChatScreen';
import ImageScreen from '@/screens/ChatScreen/ImageScreen';
import ConversationDetailsScreen from '@/screens/ConversationDetails/ConversationDetailsScreen';
import ConversationAction from '@/screens/ConversationAction/ConversationAction';

const Tab = createBottomTabNavigator();

export type TabBarExcludedScreenParamList = {
  Tab: undefined;
  ChatScreen: { index: number };
  ContactDetails: undefined;
  ConversationActions: undefined;
  Dashboard: { url: string };
  Login: undefined;
  SearchScreen: undefined;
  ImageScreen: undefined;
  ConversationDetails: undefined;
  ConversationAction: undefined;
};
const Stack = createNativeStackNavigator<TabBarExcludedScreenParamList>();

const renderTabIcon = (route, focused, color, size) => {
  let iconName = 'home';
  switch (route.name) {
    case 'Conversations':
      iconName = focused ? 'home' : 'home-outline';
      break;
    case 'Notifications':
      iconName = focused ? 'notifications' : 'notifications-outline';
      break;
    case 'Settings':
      iconName = focused ? 'settings' : 'settings-outline';
      break;
    default:
      iconName = focused ? 'home' : 'home-outline';
      break;
  }
  return <Icon icon={iconName} color={focused ? '#1F93FF' : '#293F51'} />;
};
const Tabs = () => {
  const unReadCount = useSelector(selectUnreadCount);
  const tabBarBadge = useMemo(() => {
    if (unReadCount >= 100) {
      return '99+';
    }
    return unReadCount;
  }, [unReadCount]);

  const user = useAppSelector(selectUser);
  const userPermissions = getUserPermissions(user, user?.account_id);
  const hasConversationPermission = CONVERSATION_PERMISSIONS.some(permission =>
    userPermissions.includes(permission),
  );

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => renderTabIcon(route, focused, color, size),
        tabBarActiveTintColor: '#1F93FF',
        tabBarInactiveTintColor: '#293F51',
        tabBarStyle: {
          paddingTop: 2,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarBadgeStyle: {
          minWidth: 14,
          maxHeight: 14,
          borderRadius: 7,
          fontSize: 10,
          lineHeight: 13,
          alignSelf: undefined,
        },
      })}>
      {hasConversationPermission && (
        <Tab.Screen name="Conversations" component={ConversationStack} />
      )}
      {hasConversationPermission && (
        <Tab.Screen
          name="Notifications"
          component={NotificationStack}
          options={{ tabBarBadge: tabBarBadge > 0 ? tabBarBadge : null }}
        />
      )}
      <Tab.Screen name="Settings" component={SettingsStack} />
    </Tab.Navigator>
  );
};

export const AppTabs = () => {
  const dispatch = useAppDispatch();

  const isLoggedIn = useAppSelector(selectLoggedIn);

  useEffect(() => {
    dispatch(authActions.getProfile());
  }, [dispatch]);

  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{ headerShown: false, navigationBarColor: '#FFFF' }}>
      {isLoggedIn ? (
        <Fragment>
          <Stack.Screen name="Tab" component={Tabs} />
          <Stack.Screen name="ChatScreen" component={ChatScreen} />
          <Stack.Screen name="ImageScreen" component={ImageScreen} />
          <Stack.Screen name="ConversationDetails" component={ConversationDetailsScreen} />
          <Stack.Screen name="ConversationAction" component={ConversationAction} />
        </Fragment>
      ) : (
        <AuthStack />
      )}
    </Stack.Navigator>
  );
};
