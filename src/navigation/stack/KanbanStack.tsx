import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { CreateFunnelScreen } from '@/screens/kanban/CreateFunnelScreen';
import { CreateKanbanItemScreen } from '@/screens/kanban/CreateKanbanItemScreen';
import { KanbanBoardScreen } from '@/screens/kanban/KanbanBoardScreen';
import { KanbanBoardsListScreen } from '@/screens/kanban/KanbanBoardsListScreen';
// Importar tela de edição de stage quando criada
// import { EditStageScreen } from '@/screens/kanban/EditStageScreen';

export type KanbanStackParamList = {
  KanbanBoardsList: undefined;
  KanbanBoard: { funnelId: number };
  CreateFunnel: undefined;
  CreateKanbanItem: { funnelId: number; stageId: number; stageKey?: string };
  EditKanbanItem: { itemId: number; funnelId: number; stageId: number };
  EditStage: { funnelId: number; stageId: number };
  EditFunnel: { funnelId: number };
};

const Stack = createNativeStackNavigator<KanbanStackParamList>();

export const KanbanStack = () => {
  return (
    <Stack.Navigator initialRouteName="KanbanBoardsList">
      <Stack.Screen
        options={{ headerShown: false }}
        name="KanbanBoardsList"
        component={KanbanBoardsListScreen}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name="KanbanBoard"
        component={KanbanBoardScreen}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name="CreateFunnel"
        component={CreateFunnelScreen}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name="CreateKanbanItem"
        component={CreateKanbanItemScreen}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name="EditKanbanItem"
        component={CreateKanbanItemScreen}
      />
      {/* Quando criar EditStageScreen, substituir por: */}
      {/* <Stack.Screen
        options={{ headerShown: false }}
        name="EditStage"
        component={EditStageScreen}
      /> */}
      {/* Por enquanto, usar CreateFunnelScreen temporariamente: */}
      <Stack.Screen
        options={{ headerShown: false }}
        name="EditStage"
        component={CreateFunnelScreen}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name="EditFunnel"
        component={CreateFunnelScreen}
      />
    </Stack.Navigator>
  );
};
