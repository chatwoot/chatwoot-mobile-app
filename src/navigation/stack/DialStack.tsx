import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import DialScreen from '@/screens/dial/DialScreen';

export type DialStackParamList = {
  DialScreen: undefined;
};

const Stack = createNativeStackNavigator<DialStackParamList>();

const DialStack = () => {
  return (
    <Stack.Navigator initialRouteName="DialScreen">
      <Stack.Screen options={{ headerShown: false }} name="DialScreen" component={DialScreen} />
    </Stack.Navigator>
  );
};

export default DialStack;
