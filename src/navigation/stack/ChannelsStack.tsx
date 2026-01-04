import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ChannelsScreen from '@/screens/channels/ChannelsScreen';

export type ChannelsStackParamList = {
  ChannelsScreen: undefined;
};

const Stack = createNativeStackNavigator<ChannelsStackParamList>();

export const ChannelsStack = () => {
  return (
    <Stack.Navigator initialRouteName="ChannelsScreen">
      <Stack.Screen
        options={{ headerShown: false }}
        name="ChannelsScreen"
        component={ChannelsScreen}
      />
    </Stack.Navigator>
  );
};
