import React, { useCallback, useEffect, useRef } from 'react';
import { View } from 'react-native';
import { BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { authActions } from '@/store/auth/authActions';
import * as Sentry from '@sentry/react-native';

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

import { getUserPermissions } from '@/utils/permissionUtils';
import { IOS_DESIGN, useSideTabBarLayout } from '@/utils';
import { SideToolbarProvider } from '@/context';
import { tailwind } from '@/theme';
import { CONVERSATION_PERMISSIONS } from 'constants/permissions';

import { AuthStack, ConversationStack, SettingsStack, InboxStack } from '../stack';
import ChatScreen from '@/screens/chat-screen/ChatScreen';
import ComposeScreen from '@/screens/chat-screen/ComposeScreen';
import MacrosScreen from '@/screens/chat-screen/MacrosScreen';
import ConversationActionsScreen from '@/screens/chat-screen/ConversationActionsScreen';
import ContactDetailsScreen from '@/screens/contact-details/ContactDetailsScreen';
import DashboardScreen from '@/screens/dashboard/DashboardScreen';
import SearchScreen from '@/screens/search/SearchScreen';

import { selectInstallationUrl } from '@/store/settings/settingsSelectors';
import { BottomTabBar, LayoutChangeCover, SideColumnDivider } from './BottomTabBar';
import { GlassToastHost } from '@/components-next/toast';
import { settingsActions } from '@/store/settings/settingsActions';
import { selectChatwootVersion } from '@/store/settings/settingsSelectors';
import { checkServerSupport } from '@/utils/serverUtils';
import { inboxActions } from '@/store/inbox/inboxActions';
import { labelActions } from '@/store/label/labelActions';
import actionCableConnector from '@/utils/actionCable';
import { setCurrentState } from '@/store/conversation/conversationHeaderSlice';
import AnalyticsHelper from '@/utils/analyticsUtils';
import { clearAllDeliveredNotifications } from '@/utils/pushUtils';
import { dashboardAppActions } from '@/store/dashboard-app/dashboardAppActions';
import { customAttributeActions } from '@/store/custom-attribute/customAttributeActions';
import { clearSelection } from '@/store/conversation/conversationSelectedSlice';

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
  ChatScreen: {
    conversationId: number;
    primaryActorId?: number;
    primaryActorType?: string;
    messageId?: number;
    // Shown without the slide, e.g. when folding the Duo moves the open conversation here.
    instant?: boolean;
  };
  ContactDetails: { conversationId?: number; contactId?: number };
  ComposeScreen: { conversationId: number };
  MacrosScreen: { conversationId: number };
  ConversationActionsScreen: { conversationId: number };
  ConversationActions: undefined;
  Dashboard: { url: string };
  Login: undefined;
  SearchScreen: undefined;
  ImageScreen: undefined;
  ConversationDetails: undefined;
  ConversationAction: undefined;
};
const Stack = createNativeStackNavigator<TabBarExcludedScreenParamList>();

// Pages that open in the split view's side column on the open Duo open as full-screen pages
// on iOS (pushed from the right) and as sheets on Android.
const sidePageOptions = IOS_DESIGN
  ? ({ animation: 'slide_from_right' } as const)
  : ({ presentation: 'modal', animation: 'slide_from_bottom' } as const);

const CustomTabBar = (props: BottomTabBarProps) => <BottomTabBar {...props} />;

const Tabs = () => {
  const dispatch = useAppDispatch();
  const sideTabBar = useSideTabBarLayout();
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
    dispatch(authActions.getProfile());
    dispatch(settingsActions.saveDeviceDetails());
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Re-run the account-scoped bootstrap when the active account changes, e.g. after a
  // cross-account push switch while the tabs stay mounted (mount is handled above).
  const isInitialAccountMount = useRef(true);
  useEffect(() => {
    if (isInitialAccountMount.current) {
      isInitialAccountMount.current = false;
      return;
    }
    dispatch(inboxActions.fetchInboxes());
    dispatch(labelActions.fetchLabels());
    dispatch(dashboardAppActions.index());
    dispatch(customAttributeActions.index());
    initActionCable();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId]);

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
    <SideToolbarProvider>
      <Tab.Navigator
        tabBar={CustomTabBar}
        initialRouteName="Inbox"
        // With a side tab bar (iPhone Duo), keep tab screens clear of the capsule and the
        // rounded top corners.
        sceneContainerStyle={
          sideTabBar
            ? {
                backgroundColor: tailwind.color('bg-white'),
                [sideTabBar.edge === 'right' ? 'paddingRight' : 'paddingLeft']:
                  sideTabBar.contentPadding,
              }
            : undefined
        }>
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
    </SideToolbarProvider>
  );
};

export const AppTabs = () => {
  const isLoggedIn = useAppSelector(selectLoggedIn);

  if (isLoggedIn) {
    return (
      <View style={{ flex: 1 }}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Tab" component={Tabs} />
          <Stack.Screen
            options={({ route }) => ({
              animation: route.params?.instant ? 'none' : 'slide_from_right',
            })}
            name="ChatScreen"
            component={ChatScreen}
          />
          <Stack.Screen
            options={sidePageOptions}
            name="ContactDetails"
            component={ContactDetailsScreen}
          />
          <Stack.Screen options={sidePageOptions} name="Dashboard" component={DashboardScreen} />
          <Stack.Screen
            // Full reply editor (iOS): a full-screen page like the split view's compose column.
            options={{ animation: 'slide_from_right' }}
            name="ComposeScreen"
            component={ComposeScreen}
          />
          <Stack.Screen
            options={{ animation: 'slide_from_right' }}
            name="MacrosScreen"
            component={MacrosScreen}
          />
          <Stack.Screen
            options={{ animation: 'slide_from_right' }}
            name="ConversationActionsScreen"
            component={ConversationActionsScreen}
          />
          <Stack.Screen
            options={{ headerShown: false, animation: 'slide_from_right' }}
            name="SearchScreen"
            component={SearchScreen}
          />
        </Stack.Navigator>
        <SideColumnDivider />
        <LayoutChangeCover />
        <GlassToastHost />
      </View>
    );
  } else {
    return (
      <View style={{ flex: 1 }}>
        <AuthStack />
        <GlassToastHost />
      </View>
    );
  }
};
