import React, { useEffect, Fragment } from 'react';
import { BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

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
import { BottomTabBar } from './BottomTabBar';

const Tab = createBottomTabNavigator();

export type TabParamList = {
  Conversations: undefined;
  Inbox: undefined;
  Settings: undefined;
  Login: undefined;
  ConfigInstallationURL: undefined;
  ForgotPassword: undefined;
  Search: undefined;
  Notifications: undefined;
};

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

const CustomTabBar = (props: BottomTabBarProps) => <BottomTabBar {...props} />;

const Tabs = () => {
  const user = useAppSelector(selectUser);
  const userPermissions = getUserPermissions(user, user?.account_id);
  const hasConversationPermission = CONVERSATION_PERMISSIONS.some(permission =>
    userPermissions.includes(permission),
  );

  return (
    <Tab.Navigator tabBar={CustomTabBar} initialRouteName="Conversations">
      {hasConversationPermission && (
        <Tab.Screen
          name="Conversations"
          options={{ headerShown: false }}
          component={ConversationStack}
        />
      )}
      {hasConversationPermission && (
        <Tab.Screen
          name="Notifications"
          component={NotificationStack}
          options={{ headerShown: false }}
        />
      )}
      <Tab.Screen name="Settings" options={{ headerShown: false }} component={SettingsStack} />
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
    <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
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
