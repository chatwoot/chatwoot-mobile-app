import { tailwind } from '@/theme';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

export type TabType = 'geral' | 'atribuicao' | 'agendamento' | 'relacionamentos' | 'dados';

interface TabNavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  hasAssignmentError?: boolean;
}

const TABS: { id: TabType; label: string }[] = [
  { id: 'geral', label: 'Geral' },
  { id: 'atribuicao', label: 'Atribuição' },
  { id: 'agendamento', label: 'Agendamento' },
  { id: 'relacionamentos', label: 'Relacionamento' },
  { id: 'dados', label: 'Dados' },
];

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  setActiveTab,
  hasAssignmentError,
}) => {
  return (
    <View style={tailwind.style('border-b border-gray-200')}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={tailwind.style('px-4')}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.id;
          const isAssignment = tab.id === 'atribuicao';
          
          return (
            <Pressable
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={tailwind.style(
                'mr-6 py-3 border-b-2',
                isActive ? 'border-blue-600' : 'border-transparent',
              )}>
              <View style={tailwind.style('flex-row items-center')}>
                <Text
                  style={tailwind.style(
                    'text-sm font-inter-medium-24',
                    isActive ? 'text-blue-600' : 'text-gray-500',
                    isAssignment && hasAssignmentError ? 'text-red-500' : '',
                  )}>
                  {tab.label}
                </Text>
                {isAssignment && hasAssignmentError && (
                  <View style={tailwind.style('ml-1 w-2 h-2 rounded-full bg-red-500')} />
                )}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};
