import { useEffect, useRef } from 'react';
import { AppState, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAppDispatch, useAppSelector } from '@/hooks';
import { selectLoggedIn } from '@/store/auth/authSelectors';
import { selectIsCallInProgress } from '@/store/call/callSelectors';
import { settingsActions } from '@/store/settings/settingsActions';
import { selectInstallationUrl } from '@/store/settings/settingsSelectors';
import { RequiredUpdateScreen } from '@/components-next/app-update/RequiredUpdateScreen';
import { useRequiredAppUpdate } from '@/hooks/useRequiredAppUpdate';
import { markServerPolicyLoaded, markSignedInThisSession } from '@/utils/appUpdateUtils';

import { IOS_DESIGN } from '@/utils';

import { AuthStack } from '../stack';
import ChatScreen from '@/screens/chat-screen/ChatScreen';
import ComposeScreen from '@/screens/chat-screen/ComposeScreen';
import MacrosScreen from '@/screens/chat-screen/MacrosScreen';
import BulkPickerScreen from '@/screens/conversations/BulkPickerScreen';
import ConversationActionsScreen from '@/screens/chat-screen/ConversationActionsScreen';
import ContactDetailsScreen from '@/screens/contact-details/ContactDetailsScreen';
import DashboardScreen from '@/screens/dashboard/DashboardScreen';
import SearchScreen from '@/screens/search/SearchScreen';

import { SideColumnDivider } from './SideColumnDivider';
import { LayoutChangeCover } from './LayoutChangeCover';
import { GlassToastHost } from '@/components-next/toast';
import { InAppCallScreen } from '@/screens/call';
import { Tabs } from './Tabs';

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
    instant?: boolean;
  };
  ContactDetails: { conversationId?: number; contactId?: number };
  ComposeScreen: { conversationId: number };
  MacrosScreen: { conversationId: number };
  ConversationActionsScreen: { conversationId: number };
  BulkPicker: { kind: 'assign' | 'label' };
  ConversationActions: undefined;
  Dashboard: { url: string };
  Login: undefined;
  SearchScreen: undefined;
  ImageScreen: undefined;
  ConversationDetails: undefined;
  ConversationAction: undefined;
};
const Stack = createNativeStackNavigator<TabBarExcludedScreenParamList>();

const sidePageOptions = IOS_DESIGN
  ? ({ animation: 'slide_from_right' } as const)
  : ({ presentation: 'modal', animation: 'slide_from_bottom' } as const);

export const AppTabs = () => {
  const dispatch = useAppDispatch();
  const isLoggedIn = useAppSelector(selectLoggedIn);
  const installationUrl = useAppSelector(selectInstallationUrl);
  const { isUpdateRequired, currentVersion, minVersion } = useRequiredAppUpdate();
  const isCallInProgress = useAppSelector(selectIsCallInProgress);

  // Latest request marks the policy loaded.
  const latestServerInfoRequestRef = useRef<Promise<unknown> | null>(null);
  useEffect(() => {
    if (!isLoggedIn) return;
    const fetchServerInfo = () => {
      const request = dispatch(settingsActions.getChatwootVersion({ installationUrl }));
      latestServerInfoRequestRef.current = request;
      request.finally(() => {
        if (latestServerInfoRequestRef.current === request) markServerPolicyLoaded();
      });
    };
    fetchServerInfo();
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') fetchServerInfo();
    });
    return () => subscription.remove();
  }, [dispatch, installationUrl, isLoggedIn]);

  const wasLoggedInRef = useRef(isLoggedIn);
  useEffect(() => {
    if (isLoggedIn && !wasLoggedInRef.current) {
      markSignedInThisSession();
    }
    wasLoggedInRef.current = isLoggedIn;
  }, [isLoggedIn]);

  // Replacing this view unmounts the call screen.
  if (isLoggedIn && isUpdateRequired && minVersion && !isCallInProgress) {
    return <RequiredUpdateScreen currentVersion={currentVersion} minVersion={minVersion} />;
  }

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
            options={{ presentation: 'modal' }}
            name="BulkPicker"
            component={BulkPickerScreen}
          />
          <Stack.Screen
            options={{ headerShown: false, animation: 'slide_from_right' }}
            name="SearchScreen"
            component={SearchScreen}
          />
        </Stack.Navigator>
        <SideColumnDivider />
        <LayoutChangeCover />
        <InAppCallScreen />
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
