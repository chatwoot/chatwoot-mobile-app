import { BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useRef } from 'react';

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
import { KanbanBoardScreen } from '@/screens/kanban/KanbanBoardScreen';
import { KanbanBoardsListScreen } from '@/screens/kanban/KanbanBoardsListScreen';
import { AuthStack, ConversationStack, InboxStack, KanbanStack, SettingsStack } from '../stack';

import { setCurrentState } from '@/store/conversation/conversationHeaderSlice';
import { clearSelection } from '@/store/conversation/conversationSelectedSlice';
import { customAttributeActions } from '@/store/custom-attribute/customAttributeActions';
import { dashboardAppActions } from '@/store/dashboard-app/dashboardAppActions';
import { inboxActions } from '@/store/inbox/inboxActions';
import { labelActions } from '@/store/label/labelActions';
import { settingsActions } from '@/store/settings/settingsActions';
import {
    selectAppVersion,
    selectInstallationUrl,
    selectPushToken,
} from '@/store/settings/settingsSelectors';
import { setTokenValid } from '@/store/settings/settingsSlice';
import actionCableConnector from '@/utils/actionCable';
import AnalyticsHelper from '@/utils/analyticsUtils';
import { clearAllDeliveredNotifications } from '@/utils/pushUtils';
import { checkServerSupport } from '@/utils/serverUtils';
import { BottomTabBar } from './BottomTabBar';

const Tab = createBottomTabNavigator();

export type TabParamList = {
  Conversations: undefined;
  Inbox: undefined;
  Kanban: undefined;
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
  KanbanBoardsList: undefined;
  KanbanBoard: { funnelId: number };
};
const Stack = createNativeStackNavigator<TabBarExcludedScreenParamList>();

const CustomTabBar = (props: BottomTabBarProps) => <BottomTabBar {...props} />;

const Tabs = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const installationUrl = useAppSelector(selectInstallationUrl);
  const appVersion = useAppSelector(selectAppVersion);
  const currentAccount = useAppSelector(selectCurrentUserAccount);
  const currentAccountRole = currentAccount?.role;
  const pubSubToken = useAppSelector(selectPubSubToken);
  const userId = useAppSelector(selectUserId);
  const accountId = useAppSelector(selectCurrentUserAccountId);
  const webSocketUrl = useAppSelector(selectWebSocketUrl);
  const pushToken = useAppSelector(selectPushToken);
  const isTokenValid = useAppSelector(state => state.settings.isTokenValid);

  // Ref para evitar chamadas múltiplas de saveDeviceDetails
  const hasRegisteredDeviceRef = useRef(false);
  const registrationInProgressRef = useRef(false);

  useEffect(() => {
    // Here is the place we are loading all the data for the app first time first time or user switches account
    if (user) {
      dispatch(authActions.getProfile());
      // API Access Token já é salvo automaticamente durante o login

      // Registrar dispositivo apenas uma vez por sessão ou se não tiver pushToken
      // OU se o token foi marcado como válido mas ainda não foi registrado
      if (
        (!hasRegisteredDeviceRef.current && !registrationInProgressRef.current) ||
        (isTokenValid && !hasRegisteredDeviceRef.current)
      ) {
        registrationInProgressRef.current = true;
        dispatch(settingsActions.saveDeviceDetails())
          .then(() => {
            hasRegisteredDeviceRef.current = true;
            registrationInProgressRef.current = false;
            // Token válido - carregar dados normalmente
            dispatch(setTokenValid(true));

            // Carregar dados apenas se token for válido
            dispatch(inboxActions.fetchInboxes());
            initActionCable();
            dispatch(labelActions.fetchLabels());
            dispatch(setCurrentState('none'));
            dispatch(clearSelection());
            dispatch(dashboardAppActions.index());
            dispatch(customAttributeActions.index());
          })
          .catch(error => {
            registrationInProgressRef.current = false;

            // Se for erro de token, marcar como inválido e não carregar dados
            const errorPayload = error?.payload || error;
            const isTokenError =
              (typeof errorPayload === 'object' &&
                errorPayload !== null &&
                'isTokenError' in errorPayload) ||
              (typeof errorPayload === 'string' &&
                (errorPayload.includes('token inválido') ||
                  errorPayload.includes('token não autorizado') ||
                  errorPayload.includes('configure o token') ||
                  errorPayload.includes('Access token inválido')));

            if (isTokenError) {
              dispatch(setTokenValid(false));
              // Não carregar conversas/dados se token for inválido
              console.log('[NOTCHAT] Token inválido - não carregando dados');
              // Resetar ref para permitir nova tentativa quando token for configurado
              hasRegisteredDeviceRef.current = false;
            } else {
              // Para outros erros, ainda tentar carregar dados
              dispatch(setTokenValid(true));
              dispatch(inboxActions.fetchInboxes());
              initActionCable();
              dispatch(labelActions.fetchLabels());
              dispatch(setCurrentState('none'));
              dispatch(clearSelection());
              dispatch(dashboardAppActions.index());
              dispatch(customAttributeActions.index());
            }

            // Se falhar, permite tentar novamente na próxima vez
            hasRegisteredDeviceRef.current = false;
          });
      } else if (isTokenValid && hasRegisteredDeviceRef.current) {
        // Se já registrado e token válido, carregar dados normalmente
        dispatch(inboxActions.fetchInboxes());
        initActionCable();
        dispatch(labelActions.fetchLabels());
        dispatch(setCurrentState('none'));
        dispatch(clearSelection());
        dispatch(dashboardAppActions.index());
        dispatch(customAttributeActions.index());
      }
      // Se token não válido, não carregar nada

      initAnalytics();
      initSentry();
      initPushNotifications();
    } else {
      // Reset ref quando usuário faz logout
      hasRegisteredDeviceRef.current = false;
      registrationInProgressRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, isTokenValid]); // Adicionar isTokenValid como dependência

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
    dispatch(settingsActions.getAppVersion({ installationUrl: installationUrl }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [installationUrl]);

  const userPermissions = user ? getUserPermissions(user, user.account_id) : [];

  // Checking if user has conversation permission to show inbox and conversations tabs
  const hasConversationPermission = CONVERSATION_PERMISSIONS.some(permission =>
    userPermissions.includes(permission),
  );

  const checkAppVersion = useCallback(async () => {
    if (appVersion) {
      checkServerSupport({
        installedVersion: appVersion,
        userRole: currentAccountRole,
      });
    }
  }, [appVersion, currentAccountRole]);

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
      <Tab.Screen name="Kanban" options={{ headerShown: false }} component={KanbanStack} />
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
        <Stack.Screen
          options={{
            animation: 'slide_from_right',
            headerShown: false,
          }}
          name="KanbanBoardsList"
          component={KanbanBoardsListScreen}
        />
        <Stack.Screen
          options={{
            animation: 'slide_from_right',
            headerShown: false,
          }}
          name="KanbanBoard"
          component={KanbanBoardScreen}
        />
      </Stack.Navigator>
    );
  } else {
    return <AuthStack />;
  }
};
