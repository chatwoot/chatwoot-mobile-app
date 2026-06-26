import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SettingsScreen from '@/screens/settings/SettingsScreen';
import BackofficeScreen from '@/screens/settings/backoffice/BackofficeScreen';
import NetworkDiagnosticsScreen from '@/screens/settings/backoffice/network-diagnostics/NetworkDiagnosticsScreen';

export type SettingsStackParamList = {
  SettingsScreen: undefined;
  BackofficeScreen: undefined;
  NetworkDiagnosticsScreen: undefined;
};

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export const SettingsStack = () => {
  return (
    <Stack.Navigator initialRouteName="SettingsScreen" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
      <Stack.Screen name="BackofficeScreen" component={BackofficeScreen} />
      <Stack.Screen name="NetworkDiagnosticsScreen" component={NetworkDiagnosticsScreen} />
    </Stack.Navigator>
  );
};
