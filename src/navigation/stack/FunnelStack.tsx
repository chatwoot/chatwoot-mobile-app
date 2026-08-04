/**
 * [conomni] Мобильный паритет, поток C (C4) — стек таба «Воронка», по образцу
 * `ConversationStack.tsx`: у экрана нет параметров, единственная задача стека — дать
 * `FunnelScreen` (C2/экран воронки) собственный native-stack, как у остальных табов.
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import FunnelScreen from '@/screens/funnel';

export type FunnelStackParamList = {
  FunnelScreen: undefined;
};

const Stack = createNativeStackNavigator<FunnelStackParamList>();

export const FunnelStack = () => {
  return (
    <Stack.Navigator initialRouteName="FunnelScreen">
      <Stack.Screen options={{ headerShown: false }} name="FunnelScreen" component={FunnelScreen} />
    </Stack.Navigator>
  );
};
