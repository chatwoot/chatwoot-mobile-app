import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ConversationScreen from '@/screens/conversations/ConversationScreen';

export type ConversationStackParamList = {
  ConversationScreen: undefined;
};

const Stack = createNativeStackNavigator<ConversationStackParamList>();

export const ConversationStack = () => {
  return (
    <Stack.Navigator initialRouteName="ConversationScreen">
      <Stack.Screen
        options={{ headerShown: false }}
        name="ConversationScreen"
        component={ConversationScreen}
      />
    </Stack.Navigator>
  );
};
