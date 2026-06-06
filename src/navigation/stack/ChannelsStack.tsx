import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ConversationScreen from '@/screens/conversations/ConversationScreen';

export type ChannelsStackParamList = {
  ConversationScreen: { showFilters?: boolean } | undefined;
};

const Stack = createNativeStackNavigator<ChannelsStackParamList>();

const ChannelsStack = () => {
  return (
    <Stack.Navigator initialRouteName="ConversationScreen">
      <Stack.Screen
        options={{ headerShown: false, animation: 'slide_from_right' }}
        name="ConversationScreen"
        component={ConversationScreen}
        initialParams={{ showFilters: true }}
      />
    </Stack.Navigator>
  );
};

export default ChannelsStack;
