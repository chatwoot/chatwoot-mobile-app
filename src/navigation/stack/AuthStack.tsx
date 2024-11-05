import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ConfigInstallationURL from '@/screens/auth/ConfigURLScreen';
import Login from '@/screens/auth/LoginScreen';
import ForgotPassword from '@/screens/auth/ForgotPassword';

export type AuthStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
  ConfigInstallationURL: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Login">
      <Stack.Screen
        options={{
          headerShown: false,
        }}
        name="Login"
        component={Login}
      />
      <Stack.Screen
        options={{
          headerShown: true,
          headerBackTitle: 'Back',
          headerBackVisible: true,
          headerShadowVisible: false,
          title: '',
        }}
        name="ForgotPassword"
        component={ForgotPassword}
      />
      <Stack.Screen
        options={{
          headerShown: true,
          headerBackTitle: 'Back',
          headerBackVisible: true,
          headerShadowVisible: false,
          title: '',
        }}
        name="ConfigInstallationURL"
        component={ConfigInstallationURL}
      />
    </Stack.Navigator>
  );
};
