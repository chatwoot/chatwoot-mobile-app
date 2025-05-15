import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CommunityScreen from '@/screens/community/CommunityScreen';

export type CommunityStackParamList = {
  CommunityHome: undefined;
};

const Stack = createNativeStackNavigator<CommunityStackParamList>();

export const CommunityStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="CommunityHome"
        component={CommunityScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};
