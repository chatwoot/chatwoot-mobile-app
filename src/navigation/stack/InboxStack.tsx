import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import InboxScreen from '@/screens/inbox/InboxScreen';

export type InboxStackParamList = {
  Inbox: undefined;
};

const Stack = createNativeStackNavigator<InboxStackParamList>();

export const InboxStack = () => {
  return (
    <Stack.Navigator initialRouteName="Inbox">
      <Stack.Screen options={{ headerShown: false }} name="Inbox" component={InboxScreen} />
    </Stack.Navigator>
  );
};
