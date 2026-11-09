import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { FullScreenPage } from '@/navigation/split/FullScreenPage';
import type { TabBarExcludedScreenParamList } from '@/navigation/tabs/AppTabs';

import { MacrosPane } from './components/macros/MacrosPane';

type MacrosScreenProps = NativeStackScreenProps<TabBarExcludedScreenParamList, 'MacrosScreen'>;

const MacrosScreen = ({ route, navigation }: MacrosScreenProps) => (
  <FullScreenPage background="bg-gray-50">
    <MacrosPane conversationId={route.params.conversationId} onClose={navigation.goBack} />
  </FullScreenPage>
);

export default MacrosScreen;
