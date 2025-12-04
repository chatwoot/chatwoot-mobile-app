import { BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useCallback, useEffect } from 'react';

import { authActions } from '@/store/auth/authActions';
import * as Sentry from '@sentry/react-native';

import { useAppDispatch, useAppSelector } from '@/hooks';
import {
  selectCurrentUserAccount,
  selectCurrentUserAccountId,
  selectLoggedIn,
  selectPubSubToken,
  selectUser,
  selectUserId,
} from '@/store/auth/authSelectors';
import { selectWebSocketUrl } from '@/store/settings/settingsSelectors';

import { getUserPermissions } from '@/utils/permissionUtils';
import { CONVERSATION_PERMISSIONS } from 'constants/permissions';

import ChatScreen from '@/screens/chat-screen/ChatScreen';
import ContactDetailsScreen from '@/screens/contact-details/ContactDetailsScreen';
import DashboardScreen from '@/screens/dashboard/DashboardScreen';
import { AuthStack, ConversationStack, InboxStack, SettingsStack } from '../stack';

import { setCurrentState } from '@/store/conversation/conversationHeaderSlice';
import { clearSelection } from '@/store/conversation/conversationSelectedSlice';
import { customAttributeActions } from '@/store/custom-attribute/customAttributeActions';
import { dashboardAppActions } from '@/store/dashboard-app/dashboardAppActions';
import { inboxActions } from '@/store/inbox/inboxActions';
import { labelActions } from '@/store/label/labelActions';
import { settingsActions } from '@/store/settings/settingsActions';
import { selectChatwootVersion, selectInstallationUrl } from '@/store/settings/settingsSelectors';
import actionCableConnector from '@/utils/actionCable';
import AnalyticsHelper from '@/utils/analyticsUtils';
import { clearAllDeliveredNotifications } from '@/utils/pushUtils';
import { checkServerSupport } from '@/utils/serverUtils';
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
  ChatScreen: { conversationId: number; primaryActorId?: number; primaryActorType?: string };
  ContactDetails: { conversationId: number };
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
    // Here is the place we are loading all the data for the app first time first time or user switches account
    if (user) {
      dispatch(authActions.getProfile());
      dispatch(settingsActions.saveDeviceDetails()); // Só registra token se usuário estiver logado
      dispatch(inboxActions.fetchInboxes());
      initActionCable();
      dispatch(labelActions.fetchLabels());
      dispatch(setCurrentState('none'));
      dispatch(clearSelection());
      dispatch(dashboardAppActions.index());
      dispatch(customAttributeActions.index());
      initAnalytics();
      initSentry();
      initPushNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Mudar dependência de [] para [user]

  const initAnalytics = useCallback(async () => {
    if (user) {
      AnalyticsHelper.identify(user);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initPushNotifications = useCallback(async () => {
    clearAllDeliveredNotifications();
  }, []);

  const initSentry = useCallback(async () => {
    Sentry.setUser({
      id: user?.id,
      email: user?.email,
      account_id: user?.account_id,
      name: user?.name,
      role: user?.role,
      installation_url: installationUrl,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initActionCable = useCallback(async () => {
    if (pubSubToken && webSocketUrl && accountId && userId) {
      actionCableConnector.init({ pubSubToken, webSocketUrl, accountId, userId });
    }
  }, [accountId, pubSubToken, userId, webSocketUrl]);

  useEffect(() => {
    dispatch(settingsActions.getChatwootVersion({ installationUrl: installationUrl }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [installationUrl]);

  const userPermissions = user ? getUserPermissions(user, user.account_id) : [];

  // Checking if user has conversation permission to show inbox and conversations tabs
  const hasConversationPermission = CONVERSATION_PERMISSIONS.some(permission =>
    userPermissions.includes(permission),
  );

  const checkAppVersion = useCallback(async () => {
    if (chatwootVersion) {
      checkServerSupport({
        installedVersion: chatwootVersion,
        userRole: currentAccountRole,
      });
    }
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
        <Stack.Screen
          options={{ animation: 'slide_from_right' }}
          name="ChatScreen"
          component={ChatScreen}
        />
        <Stack.Screen
          options={{
            presentation: 'formSheet',
            animation: 'slide_from_bottom',
          }}
          name="ContactDetails"
          component={ContactDetailsScreen}
        />
        <Stack.Screen
          options={{
            presentation: 'formSheet',
            animation: 'slide_from_bottom',
          }}
          name="Dashboard"
          component={DashboardScreen}
        />
      </Stack.Navigator>
    );
  } else {
    return <AuthStack />;
  }
};
