import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ConfigInstallationURL from '@/screens/auth/ConfigURLScreen';
import Login from '@/screens/auth/LoginScreen';
import ForgotPassword from '@/screens/auth/ForgotPassword';
import MFAScreen from '@/screens/auth/MFAScreen';

export type AuthStackParamList = {
  Login: undefined;
  ResetPassword: undefined;
  ConfigureURL: undefined;
  MFAScreen: undefined;
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
        name="ResetPassword"
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
        name="ConfigureURL"
        component={ConfigInstallationURL}
      />
      <Stack.Screen
        options={{
          headerShown: true,
          headerBackTitle: 'Back',
          headerBackVisible: true,
          headerShadowVisible: false,
          title: '',
        }}
        name="MFAScreen"
        component={MFAScreen}
      />
    </Stack.Navigator>
  );
};
