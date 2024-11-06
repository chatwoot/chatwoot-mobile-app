import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import NotificationScreen from '@/screens/Notification/NotificationScreen';

export type NotificationStackParamList = {
  NotificationScreen: undefined;
};

const Stack = createNativeStackNavigator<NotificationStackParamList>();

export const NotificationStack = () => {
  return (
    <Stack.Navigator initialRouteName="NotificationScreen">
      <Stack.Screen
        options={{ headerShown: false }}
        name="NotificationScreen"
        component={NotificationScreen}
      />
    </Stack.Navigator>
  );
};
