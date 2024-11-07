import React, { useCallback, useEffect } from 'react';
import { BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { authActions } from '@/store/auth/authActions';
import { useAppDispatch, useAppSelector } from '@/hooks';
import {
  selectLoggedIn,
  selectUser,
  selectCurrentUserAccount,
  selectPubSubToken,
  selectUserId,
  selectCurrentUserAccountId,
} from '@/store/auth/authSelectors';
import { selectWebSocketUrl } from '@/store/settings/settingsSelectors';


import { getUserPermissions } from 'helpers/permissionHelper';
import { CONVERSATION_PERMISSIONS } from 'constants/permissions';

import { AuthStack, ConversationStack, InboxStack, SettingsStack } from '../stack';
// import ChatScreen from '@/screens/ChatScreen/ChatScreen';
// import ImageScreen from '@/screens/ChatScreen/ImageScreen';
// import ConversationDetailsScreen from '@/screens/ConversationDetails/ConversationDetailsScreen';
// import ConversationAction from '@/screens/ConversationAction/ConversationAction';
import { selectInstallationUrl } from '@/store/settings/settingsSelectors';
import { BottomTabBar } from './BottomTabBar';
import { settingsActions } from '@/store/settings/settingsActions';
import { selectChatwootVersion } from '@/store/settings/settingsSelectors';
import { checkServerSupport } from '@/helpers/ServerHelper';
import ActionCable from '@/helpers/ActionCable';

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
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const installationUrl = useAppSelector(selectInstallationUrl);
  const chatwootVersion = useAppSelector(selectChatwootVersion);
  const currentAccount = useAppSelector(selectCurrentUserAccount);
  const currentAccountRole = currentAccount?.role;
  const pubSubToken = useAppSelector(selectPubSubToken);
  const userId = useAppSelector(selectUserId);
  const accountId = useAppSelector(selectCurrentUserAccountId);
  const webSocketUrl = useAppSelector(selectWebSocketUrl);

  useEffect(() => {
    dispatch(authActions.getProfile());
    dispatch(settingsActions.saveDeviceDetails());
    initActionCable();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initActionCable = useCallback(async () => {
    ActionCable.init({ pubSubToken, webSocketUrl, accountId, userId });
  }, [accountId, pubSubToken, userId, webSocketUrl]);

  useEffect(() => {
    dispatch(settingsActions.getChatwootVersion({ installationUrl: installationUrl }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [installationUrl]);

  const userPermissions = getUserPermissions(user, user?.account_id);
  const hasConversationPermission = CONVERSATION_PERMISSIONS.some(permission =>
    userPermissions.includes(permission),
  );

  const checkAppVersion = useCallback(async () => {
    checkServerSupport({
      installedVersion: chatwootVersion,
      userRole: currentAccountRole,
    });
  }, [chatwootVersion, currentAccountRole]);

  useEffect(() => {
    checkAppVersion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Tab.Navigator tabBar={CustomTabBar} initialRouteName="Inbox">
      {hasConversationPermission && (
        <Tab.Screen name="Inbox" component={InboxStack} options={{ headerShown: false }} />
      )}
      {hasConversationPermission && (
        <Tab.Screen
          name="Conversations"
          options={{ headerShown: false }}
          component={ConversationStack}
        />
      )}
      <Tab.Screen name="Settings" options={{ headerShown: false }} component={SettingsStack} />
    </Tab.Navigator>
  );
};

export const AppTabs = () => {
  const isLoggedIn = useAppSelector(selectLoggedIn);

  if (isLoggedIn) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Tab" component={Tabs} />
        {/* <Stack.Screen name="ChatScreen" component={ChatScreen} />
        <Stack.Screen name="ImageScreen" component={ImageScreen} />
        <Stack.Screen name="ConversationDetails" component={ConversationDetailsScreen} />
        <Stack.Screen name="ConversationAction" component={ConversationAction} /> */}
      </Stack.Navigator>
    );
  } else {
    return <AuthStack />;
  }
};
