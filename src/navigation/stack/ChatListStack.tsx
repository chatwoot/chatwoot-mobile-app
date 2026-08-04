/**
 * [conomni] Мобильный паритет, поток C (C4) — стек для одного из трёх списочных табов
 * («Новые»/«Мои»/«Архив»). Все три таба в `AppTabs.tsx` используют этот же компонент через
 * `children`-форму `Tab.Screen` (`{() => <ChatListStack tab="new" />}` и т.д.) — так вкладка
 * приходит явным пропом, а не через `route.params`, что и обходит несовместимость типов
 * между нетипизированным `Tab.Navigator` (`ParamListBase`) и нашим `TabParamList` (пробовали
 * `component={ChatListStack}` + `initialParams`/`RouteProp<TabParamList, ...>` — TS ругался
 * на несовместимость `RouteProp<ParamListBase, "ChatListNew">` с более узким
 * `RouteProp<TabParamList, ...>`, контравариантность параметров функции). Сам
 * `ChatListScreen` (C5) читает вкладку из `route.params.tab` вложенного `Stack.Screen` через
 * `resolveRouteTab` (`src/screens/chat-list/components/ChatListHeader.tsx`) — дефолт там тот
 * же ('new'), что и в `resolveInitialChatListTab` ниже, специально: два независимых
 * защитных дефолта на случай отсутствия пропа, а не рассинхронизация.
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ChatListScreen from '@/screens/chat-list';
import type { ChatListTab } from '@/store/chat-list/chatListTypes';
import { resolveInitialChatListTab } from './chatListStackUtils';

export type ChatListStackParamList = {
  ChatListScreen: { tab: ChatListTab };
};

const Stack = createNativeStackNavigator<ChatListStackParamList>();

export interface ChatListStackProps {
  tab?: ChatListTab;
}

export const ChatListStack: React.FC<ChatListStackProps> = ({ tab }) => {
  const resolvedTab = resolveInitialChatListTab(tab);

  return (
    <Stack.Navigator initialRouteName="ChatListScreen">
      <Stack.Screen
        options={{ headerShown: false }}
        name="ChatListScreen"
        initialParams={{ tab: resolvedTab }}
        component={ChatListScreen}
      />
    </Stack.Navigator>
  );
};
