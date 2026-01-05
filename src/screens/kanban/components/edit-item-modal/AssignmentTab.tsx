import { tailwind } from '@/theme';
import React from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

interface AssignmentTabProps {
  assignedAgents: any[];
  availableAgents: any[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedAgents: number[];
  handleToggleAgent: (id: number) => void;
  isSaving?: boolean;
}

export const AssignmentTab: React.FC<AssignmentTabProps> = ({
  assignedAgents,
  availableAgents,
  searchQuery,
  setSearchQuery,
  selectedAgents,
  handleToggleAgent,
  isSaving,
}) => {
  // Filtrar agentes disponíveis
  const filteredAgents = availableAgents.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (agent.email && agent.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const isAgentSelected = (id: number) => selectedAgents.includes(id);

  return (
    <View style={tailwind.style('flex-1 px-4 pt-4')}>
      {/* Input de busca */}
      <TextInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Buscar agentes..."
        placeholderTextColor={tailwind.color('text-gray-400')}
        style={tailwind.style(
          'bg-white border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-950 font-inter-normal-20 mb-4',
        )}
      />

      {/* Lista de agentes */}
      <View style={tailwind.style('gap-2')}>
        {filteredAgents.length === 0 ? (
          <Text style={tailwind.style('text-center text-gray-500 py-4')}>
            Nenhum agente encontrado
          </Text>
        ) : (
          filteredAgents.map(agent => (
            <Pressable
              key={agent.id}
              onPress={() => handleToggleAgent(agent.id)}
              disabled={isSaving}
              style={tailwind.style(
                `bg-white rounded-lg p-3 border border-gray-200 flex-row items-center justify-between ${
                  isAgentSelected(agent.id) ? 'border-blue-500 bg-blue-50' : ''
                }`,
              )}>
              <View style={tailwind.style('flex-row items-center flex-1')}>
                <View
                  style={tailwind.style(
                    'w-10 h-10 rounded-full bg-blue-500 items-center justify-center mr-3',
                  )}>
                  <Text style={tailwind.style('text-white text-sm font-inter-medium-24')}>
                    {agent.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={tailwind.style('flex-1')}>
                  <Text style={tailwind.style('text-base font-inter-medium-24 text-gray-950')}>
                    {agent.name}
                  </Text>
                  {agent.email && (
                    <Text style={tailwind.style('text-xs text-gray-500 mt-1')}>
                      {agent.email}
                    </Text>
                  )}
                </View>
              </View>
              <View
                style={tailwind.style(
                  `w-6 h-6 rounded border items-center justify-center ${
                    isAgentSelected(agent.id)
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-gray-300 bg-white'
                  }`,
                )}>
                {isAgentSelected(agent.id) && (
                  <Text style={tailwind.style('text-white text-xs')}>✓</Text>
                )}
              </View>
            </Pressable>
          ))
        )}
      </View>
    </View>
  );
};
