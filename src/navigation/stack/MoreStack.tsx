import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CompaniesScreen from '@/screens/companies/CompaniesScreen';
import MoreScreen from '@/screens/more/MoreScreen';
import ReportWebViewScreen from '@/screens/reports/ReportWebViewScreen';
import ReportsScreen from '@/screens/reports/ReportsScreen';
import SettingsScreen from '@/screens/settings/SettingsScreen';
import VoiceAlertSettingsScreen from '@/screens/voice-alerts/VoiceAlertSettingsScreen';

export type MoreStackParamList = {
  MoreScreen: undefined;
  CompaniesScreen: undefined;
  ReportsScreen: undefined;
  ReportWebViewScreen: { title: string; url: string };
  SettingsScreen: undefined;
  VoiceAlertSettingsScreen: undefined;
};

const Stack = createNativeStackNavigator<MoreStackParamList>();

const MoreStack = () => {
  return (
    <Stack.Navigator initialRouteName="MoreScreen">
      <Stack.Screen options={{ headerShown: false }} name="MoreScreen" component={MoreScreen} />
      <Stack.Screen
        options={{ headerShown: false }}
        name="CompaniesScreen"
        component={CompaniesScreen}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name="ReportsScreen"
        component={ReportsScreen}
      />
      <Stack.Screen
        options={{ headerShown: false, animation: 'slide_from_right' }}
        name="ReportWebViewScreen"
        component={ReportWebViewScreen}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name="SettingsScreen"
        component={SettingsScreen}
      />
      <Stack.Screen
        options={{ headerShown: false, animation: 'slide_from_right' }}
        name="VoiceAlertSettingsScreen"
        component={VoiceAlertSettingsScreen}
      />
    </Stack.Navigator>
  );
};

export default MoreStack;
