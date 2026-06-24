import React, { useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
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

import {
  AuthStack,
  ChannelsStack,
  ContactsStack,
  DialStack,
  InboxStack,
  MoreStack,
} from '../stack';
import { getUserPermissions } from '@/utils/permissionUtils';
import { CONVERSATION_PERMISSIONS } from '@/constants/permissions';
import ChatScreen from '@/screens/chat-screen/ChatScreen';
import ContactDetailsScreen from '@/screens/contact-details/ContactDetailsScreen';
import CompanyDetailsScreen from '@/screens/company-details/CompanyDetailsScreen';
import DashboardScreen from '@/screens/dashboard/DashboardScreen';
import SearchScreen from '@/screens/search/SearchScreen';

import { selectInstallationUrl } from '@/store/settings/settingsSelectors';
import { BottomTabBar } from './BottomTabBar';
import { settingsActions } from '@/store/settings/settingsActions';
import { selectChatwootVersion } from '@/store/settings/settingsSelectors';
import { checkServerSupport } from '@/utils/serverUtils';
import { inboxActions } from '@/store/inbox/inboxActions';
import { selectAllInboxes } from '@/store/inbox/inboxSelectors';
import { labelActions } from '@/store/label/labelActions';
import actionCableConnector from '@/utils/actionCable';
import { setCurrentState } from '@/store/conversation/conversationHeaderSlice';
import AnalyticsHelper from '@/utils/analyticsUtils';
import { clearAllDeliveredNotifications } from '@/utils/pushUtils';
import { dashboardAppActions } from '@/store/dashboard-app/dashboardAppActions';
import { customAttributeActions } from '@/store/custom-attribute/customAttributeActions';
import { clearSelection } from '@/store/conversation/conversationSelectedSlice';
import { isVoiceCallEnabled } from '@/utils/inboxUtils';
import { nativeVoiceRegistrationService } from '@/services/voice/nativeVoiceRegistrationService';
import type { Contact } from '@/types/Contact';
import type { Company } from '@/types/Company';
import type { SearchSectionType } from '@/store/search/searchTypes';

const Tab = createBottomTabNavigator();

export type TabParamList = {
  Inbox: undefined;
  Contacts: undefined;
  Dial: undefined;
  Channels: undefined;
  More: undefined;
};

export type TabBarExcludedScreenParamList = {
  Tab: undefined;
  ChatScreen: {
    conversationId: number;
    primaryActorId?: number;
    primaryActorType?: string;
    messageId?: number;
  };
  ContactDetails: {
    conversationId?: number;
    contactId?: number;
    contact?: Partial<Contact>;
    company?: Pick<Company, 'id' | 'name'>;
  };
  CompanyDetails: {
    companyId: number;
    contactsCount?: number;
    companyName?: string;
    companyDomain?: string | null;
    companyDescription?: string | null;
    companyAvatarUrl?: string | null;
  };
  ConversationActions: undefined;
  Dashboard: { url: string };
  Login: undefined;
  SearchScreen:
    | {
        initialTab?: 'all' | SearchSectionType;
      }
    | undefined;
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
  const inboxes = useAppSelector(selectAllInboxes);
  const userPermissions = user ? getUserPermissions(user, user.account_id) : [];
  const hasConversationPermission = CONVERSATION_PERMISSIONS.some(permission =>
    userPermissions.includes(permission),
  );
  const hasVoiceCallInbox = inboxes.some(isVoiceCallEnabled);

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

  useEffect(() => {
    dispatch(settingsActions.getChatwootVersion({ installationUrl: installationUrl }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [installationUrl]);

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

  useEffect(() => {
    nativeVoiceRegistrationService
      .syncTwilioVoiceRegistrations({ accountId, inboxes })
      .catch(error => {
        Sentry.captureException(error);
      });
  }, [accountId, inboxes]);

  useEffect(() => {
    return () => {
      nativeVoiceRegistrationService.unregisterAll().catch(error => {
        Sentry.captureException(error);
      });
    };
  }, []);

  return (
    <Tab.Navigator
      tabBar={CustomTabBar}
      screenOptions={{ headerShown: false }}
      initialRouteName={hasConversationPermission ? 'Inbox' : 'More'}>
      {hasConversationPermission && <Tab.Screen name="Inbox" component={InboxStack} />}
      {hasConversationPermission && <Tab.Screen name="Channels" component={ChannelsStack} />}
      {hasConversationPermission && hasVoiceCallInbox && (
        <Tab.Screen name="Dial" component={DialStack} />
      )}
      {hasConversationPermission && <Tab.Screen name="Contacts" component={ContactsStack} />}
      <Tab.Screen name="More" component={MoreStack} />
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
            presentation: Platform.OS === 'ios' ? 'formSheet' : 'modal',
            animation: 'slide_from_bottom',
          }}
          name="ContactDetails"
          component={ContactDetailsScreen}
        />
        <Stack.Screen
          options={{
            presentation: Platform.OS === 'ios' ? 'formSheet' : 'modal',
            animation: 'slide_from_bottom',
          }}
          name="CompanyDetails"
          component={CompanyDetailsScreen}
        />
        <Stack.Screen
          options={{
            presentation: Platform.OS === 'ios' ? 'formSheet' : 'modal',
            animation: 'slide_from_bottom',
          }}
          name="Dashboard"
          component={DashboardScreen}
        />
        <Stack.Screen
          options={{ headerShown: false, animation: 'slide_from_right' }}
          name="SearchScreen"
          component={SearchScreen}
        />
      </Stack.Navigator>
    );
  } else {
    return <AuthStack />;
  }
};
