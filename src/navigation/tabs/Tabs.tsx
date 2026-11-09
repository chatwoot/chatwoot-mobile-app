import { useCallback, useEffect, useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { authActions } from '@/store/auth/authActions';
import * as Sentry from '@sentry/react-native';

import { useAppDispatch, useAppSelector } from '@/hooks';
import {
  selectUser,
  selectCurrentUserAccount,
  selectPubSubToken,
  selectUserId,
  selectCurrentUserAccountId,
} from '@/store/auth/authSelectors';
import { selectWebSocketUrl } from '@/store/settings/settingsSelectors';

import { getUserPermissions } from '@/utils/permissionUtils';
import { useSideTabBarLayout } from '@/utils';
import { SideToolbarProvider } from '@/context';
import { tailwind } from '@/theme';
import { CONVERSATION_PERMISSIONS } from 'constants/permissions';

import { ConversationStack, SettingsStack, InboxStack } from '../stack';

import { selectInstallationUrl } from '@/store/settings/settingsSelectors';
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
import { runCallReadiness } from '@/screens/call/utils/callReadiness';
import { RESULTS, checkNotifications, requestNotifications } from 'react-native-permissions';
import { CustomTabBar } from './CustomTabBar';

const Tab = createBottomTabNavigator();

export const Tabs = () => {
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
    const inboxesLoaded = dispatch(inboxActions.fetchInboxes());
    askForPermissions(inboxesLoaded);
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

  const askForPermissions = useCallback(async (inboxesLoaded: Promise<unknown>) => {
    try {
      const { status } = await checkNotifications();
      if (status !== RESULTS.GRANTED) await requestNotifications(['alert', 'sound', 'badge']);
      await inboxesLoaded;
      await runCallReadiness();
    } catch {
      // Prompt failures must not prevent registration.
    }
    dispatch(settingsActions.saveDeviceDetails());
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
