import { BottomSheetBackdrop, BottomSheetWrapper, Icon } from '@/components-next';
import { Spinner } from '@/components-next/spinner';
import { useAppSelector } from '@/hooks';
import {
  selectCurrentKanbanFunnel,
  selectKanbanFunnels,
  selectKanbanItemById,
} from '@/store/kanban/kanbanSelectors';
import type { KanbanItem } from '@/store/kanban/kanbanTypes';
import { Trash } from '@/svg-icons/common';
import { tailwind } from '@/theme';
import {
  BottomSheetModal,
  BottomSheetScrollView,
  useBottomSheetSpringConfigs,
} from '@gorhom/bottom-sheet';
import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { MODAL_SNAP_POINTS } from '../constants';
import { useAgentAssignment } from '../hooks/useAgentAssignment';
import { formatAgentInitials } from '../utils/kanbanHelpers';

interface ManageAgentsModalProps {
  item: KanbanItem | null;
  sheetRef: React.RefObject<BottomSheetModal>;
  onClose: () => void;
  onAgentsUpdated?: () => void;
}

export const ManageAgentsModal: React.FC<ManageAgentsModalProps> = ({
  item,
  sheetRef,
  onClose,
  onAgentsUpdated,
}) => {
  const currentFunnel = useAppSelector(selectCurrentKanbanFunnel);
  const allFunnels = useAppSelector(selectKanbanFunnels);
  const [searchQuery, setSearchQuery] = useState('');

  const updatedItem = useAppSelector(state => {
    if (!item?.id) return item;

    const itemFromStore = selectKanbanItemById(state, item.id);
    if (itemFromStore) return itemFromStore;

    const funnel = selectCurrentKanbanFunnel(state);
    if (funnel?.stages) {
      const stages = Array.isArray(funnel.stages) ? funnel.stages : [];
      for (const stage of stages) {
        if (Array.isArray(stage.items)) {
          const foundItem = stage.items.find(i => i.id === item.id);
          if (foundItem) return foundItem;
        }
      }
    }

    return item;
  });

  const currentItem = updatedItem || item;

  const { assignAgent, removeAgent, isAssigning, isRemoving } = useAgentAssignment({
    item: currentItem,
    funnelId: currentFunnel?.id || 0,
    onSuccess: onAgentsUpdated,
  });

  const assignedAgents = useMemo(() => {
    return currentItem?.assigned_agents || [];
  }, [currentItem?.assigned_agents]);

  const accountAgents = useAppSelector(state => state.kanban?.accountAgents || []);

  const availableAgents = useMemo(() => {
    let agents: Array<{ id: number; name: string; email: string }> = [];

    if (Array.isArray(accountAgents) && accountAgents.length > 0) {
      agents = accountAgents.map(agent => ({
        id: agent.id,
        name: agent.name || agent.availableName || agent.email || 'Agente sem nome',
        email: agent.email || '',
        role: agent.role || 'agent',
        availability_status: agent.availabilityStatus,
      }));
    } else {
      agents = currentFunnel?.settings?.agents || [];

      if (agents.length === 0 && allFunnels.length > 0) {
        for (const funnel of allFunnels) {
          if (funnel.settings?.agents && funnel.settings.agents.length > 0) {
            agents = funnel.settings.agents;
            break;
          }
        }
      }
    }

    return agents;
  }, [accountAgents, currentFunnel?.settings?.agents, allFunnels]);

  const filteredAvailableAgents = useMemo(() => {
    const assignedAgentIds = new Set(assignedAgents.map(agent => agent.id));
    return availableAgents.filter(agent => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.email.toLowerCase().includes(searchQuery.toLowerCase());
      const isNotAssigned = !assignedAgentIds.has(agent.id);
      return matchesSearch && isNotAssigned;
    });
  }, [availableAgents, assignedAgents, searchQuery]);

  const springConfig = useBottomSheetSpringConfigs({
    damping: 80,
    overshootClamping: true,
    restDisplacementThreshold: 0.1,
    restSpeedThreshold: 0.1,
    stiffness: 500,
  });

  const snapPoints = useMemo(() => [...MODAL_SNAP_POINTS.MANAGE_AGENTS], []);

  const formatDate = useCallback((dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  }, []);

  return (
    <BottomSheetModal
      ref={sheetRef}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      enableDismissOnClose
      onDismiss={onClose}
      backdropComponent={BottomSheetBackdrop}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize">
      <BottomSheetWrapper>
        <BottomSheetScrollView
          style={tailwind.style('flex-1')}
          contentContainerStyle={tailwind.style('pb-6')}>
          {/* Header */}
          <View style={tailwind.style('flex-row items-center justify-between mb-6 px-4 pt-4')}>
            <Text style={tailwind.style('text-xl font-inter-semibold-20 text-gray-950')}>
              Gerenciar Agentes Atribuídos
            </Text>
            <Pressable onPress={onClose} style={tailwind.style('p-2')}>
              <Text style={tailwind.style('text-xl text-gray-600')}>✕</Text>
            </Pressable>
          </View>

          {/* Agentes Atribuídos */}
          <View style={tailwind.style('px-4 mb-6')}>
            <Text style={tailwind.style('text-base font-inter-medium-24 text-gray-950 mb-3')}>
              Agentes Atribuídos ({assignedAgents.length})
            </Text>

            {assignedAgents.length === 0 ? (
              <View style={tailwind.style('bg-gray-50 rounded-lg p-4 items-center')}>
                <Text style={tailwind.style('text-sm text-gray-500')}>Nenhum agente atribuído</Text>
              </View>
            ) : (
              <View style={tailwind.style('gap-2')}>
                {assignedAgents.map(agent => (
                  <View
                    key={agent.id}
                    style={tailwind.style(
                      'bg-white rounded-lg p-4 border border-gray-200 flex-row items-center justify-between',
                    )}>
                    <View style={tailwind.style('flex-row items-center flex-1')}>
                      <View
                        style={tailwind.style(
                          'w-10 h-10 rounded-full bg-blue-500 items-center justify-center mr-3',
                        )}>
                        <Text style={tailwind.style('text-white text-sm font-inter-medium-24')}>
                          {formatAgentInitials([agent])}
                        </Text>
                      </View>
                      <View style={tailwind.style('flex-1')}>
                        <Text
                          style={tailwind.style('text-base font-inter-medium-24 text-gray-950')}>
                          {agent.name}
                        </Text>
                        <Text style={tailwind.style('text-xs text-gray-500 mt-1')}>
                          Atribuído em{' '}
                          {formatDate(currentItem?.updated_at || currentItem?.created_at)}
                        </Text>
                      </View>
                    </View>
                    <Pressable
                      onPress={() => removeAgent(agent.id)}
                      disabled={isRemoving === agent.id}
                      style={tailwind.style('p-2 ml-2')}>
                      {isRemoving === agent.id ? (
                        <Spinner size={20} />
                      ) : (
                        <Icon size={20} icon={<Trash />} />
                      )}
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Adicionar Novo Agente */}
          <View style={tailwind.style('px-4')}>
            <Text style={tailwind.style('text-base font-inter-medium-24 text-gray-950 mb-3')}>
              Adicionar Novo Agente
            </Text>

            {/* Input de busca */}
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Buscar agentes..."
              placeholderTextColor={tailwind.color('text-gray-400')}
              style={tailwind.style(
                'bg-white border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-950 font-inter-normal-20 mb-3',
              )}
            />

            {/* Lista de agentes disponíveis */}
            {filteredAvailableAgents.length === 0 ? (
              <View style={tailwind.style('bg-gray-50 rounded-lg p-4 items-center')}>
                <Text style={tailwind.style('text-sm text-gray-500 mb-2')}>
                  {searchQuery.trim() === ''
                    ? availableAgents.length === 0
                      ? 'Nenhum agente configurado no funil'
                      : 'Todos os agentes já estão atribuídos'
                    : 'Nenhum agente encontrado'}
                </Text>
                {availableAgents.length === 0 && (
                  <Text style={tailwind.style('text-xs text-gray-400 text-center mt-1')}>
                    Configure os agentes nas configurações do funil
                  </Text>
                )}
              </View>
            ) : (
              <View style={tailwind.style('gap-2')}>
                {filteredAvailableAgents.map(agent => {
                  const isAssigningThis = isAssigning === agent.id;
                  return (
                    <Pressable
                      key={agent.id}
                      onPress={() => assignAgent(agent.id)}
                      disabled={isAssigningThis}
                      style={tailwind.style(
                        `bg-white rounded-lg p-4 border border-gray-200 flex-row items-center justify-between ${
                          isAssigningThis ? 'opacity-50' : ''
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
                          <Text
                            style={tailwind.style('text-base font-inter-medium-24 text-gray-950')}>
                            {agent.name}
                          </Text>
                          <Text style={tailwind.style('text-xs text-gray-500 mt-1')}>
                            {agent.email}
                          </Text>
                        </View>
                      </View>
                      {isAssigningThis ? (
                        <Spinner size={20} />
                      ) : (
                        <Text style={tailwind.style('text-sm text-blue-600 font-inter-medium-24')}>
                          Adicionar
                        </Text>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
        </BottomSheetScrollView>
      </BottomSheetWrapper>
    </BottomSheetModal>
  );
};
