import { ColorPicker } from '@/components-next';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { kanbanActions } from '@/store/kanban/kanbanActions';
import { selectCurrentKanbanFunnel } from '@/store/kanban/kanbanSelectors';
import { tailwind } from '@/theme';
import { logger } from '@/utils/logger';
import { showToast } from '@/utils/toastUtils';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

interface StageForm {
  name: string;
  color: string;
  description: string;
  autoCreateConditions: Array<{
    type: string;
    value: string;
  }>;
}

interface CustomAttributeForm {
  key: string;
  type: string;
  unique: boolean;
}

interface FunnelForm {
  name: string;
  description: string;
  active: boolean;
  stages: StageForm[];
  agents: number[];
  messageTemplates: unknown[];
  globalCustomAttributes: CustomAttributeForm[];
}

interface RouteParams {
  funnelId?: number;
}

export const CreateFunnelScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const params = (route.params as RouteParams) || {};
  const funnelId = params.funnelId;

  const isEditMode = !!funnelId;
  const currentFunnel = useAppSelector(selectCurrentKanbanFunnel);
  const funnels = useAppSelector(state => state.kanban.funnels);
  const [stages, setStages] = useState<StageForm[]>([]);
  const [selectedAgents, setSelectedAgents] = useState<number[]>([]);
  const [currentStage, setCurrentStage] = useState<Partial<StageForm>>({
    name: '',
    color: '#FF6B6B',
    description: '',
    autoCreateConditions: [],
  });
  const [customAttributes, setCustomAttributes] = useState<CustomAttributeForm[]>([]);
  const [currentCustomAttribute, setCurrentCustomAttribute] = useState<
    Partial<CustomAttributeForm>
  >({
    key: '',
    type: 'text',
    unique: false,
  });
  const [isActive, setIsActive] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    stages: true,
    agents: true,
    messageTemplates: true,
    customAttributes: true,
  });

  const colorPickerRef = useRef<BottomSheetModal>(null);
  const agentsLoadedRef = useRef(false);

  const accountAgents = useAppSelector(state => state.kanban?.accountAgents || []);
  const availableAgents = Array.isArray(accountAgents) && accountAgents.length > 0 
    ? accountAgents 
    : (Array.isArray(funnels?.[0]?.settings?.agents) ? funnels[0].settings.agents : []);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FunnelForm>({
    defaultValues: {
      name: '',
      description: '',
      active: true,
      stages: [],
      agents: [],
      messageTemplates: [],
      globalCustomAttributes: [],
    },
  });

  // Carregar funil quando estiver em modo edição
  useEffect(() => {
    if (isEditMode && funnelId) {
      dispatch(kanbanActions.getFunnel(funnelId));
    }
  }, [isEditMode, funnelId, dispatch]);

  // Carregar agentes da conta quando a tela abrir (apenas uma vez)
  useEffect(() => {
    if (!agentsLoadedRef.current && (!Array.isArray(accountAgents) || accountAgents.length === 0)) {
      agentsLoadedRef.current = true;
      dispatch(kanbanActions.getAccountAgents());
    }
  }, [dispatch]);

  // Preencher formulário quando o funil for carregado
  useEffect(() => {
    if (isEditMode && currentFunnel && currentFunnel.id === funnelId) {
      reset({
        name: currentFunnel.name || '',
        description: currentFunnel.description || '',
      });

      setIsActive(currentFunnel.active ?? true);

      // Carregar stages
      if (currentFunnel.stages) {
        if (Array.isArray(currentFunnel.stages)) {
          const stagesForm: StageForm[] = currentFunnel.stages.map(stage => ({
            name: stage.name,
            color: stage.color || '#FF6B6B',
            description: stage.description || '',
            autoCreateConditions: [], // Pode precisar mapear se existir
          }));
          setStages(stagesForm);
        }
      }

      // Carregar agentes
      if (currentFunnel.settings?.agents) {
        setSelectedAgents(currentFunnel.settings.agents.map(a => a.id));
      }

      // Carregar custom attributes
      if (currentFunnel.global_custom_attributes) {
        // Mapear conforme necessário
      }
    }
  }, [isEditMode, currentFunnel, funnelId, reset]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleAddStage = () => {
    if (currentStage.name) {
      const newStage: StageForm = {
        name: currentStage.name,
        color: currentStage.color || '#FF6B6B',
        description: currentStage.description || '',
        autoCreateConditions: currentStage.autoCreateConditions || [],
      };
      setStages([...stages, newStage]);
      setCurrentStage({
        name: '',
        color: '#FF6B6B',
        description: '',
        autoCreateConditions: [],
      });
    }
  };

  const handleRemoveStage = (index: number) => {
    setStages(stages.filter((_, i) => i !== index));
  };

  const handleAddAutoCreateCondition = () => {
    const newCondition = {
      type: 'contact_has_tag',
      value: '',
    };
    setCurrentStage({
      ...currentStage,
      autoCreateConditions: [...(currentStage.autoCreateConditions || []), newCondition],
    });
  };

  const handleRemoveAutoCreateCondition = (index: number) => {
    const updated = (currentStage.autoCreateConditions || []).filter((_, i) => i !== index);
    setCurrentStage({ ...currentStage, autoCreateConditions: updated });
  };

  const handleToggleAgent = (agentId: number) => {
    if (selectedAgents.includes(agentId)) {
      setSelectedAgents(selectedAgents.filter(id => id !== agentId));
    } else {
      setSelectedAgents([...selectedAgents, agentId]);
    }
  };

  const handleAddCustomAttribute = () => {
    if (currentCustomAttribute.key) {
      const newAttribute: CustomAttributeForm = {
        key: currentCustomAttribute.key,
        type: currentCustomAttribute.type || 'text',
        unique: currentCustomAttribute.unique || false,
      };
      setCustomAttributes([...customAttributes, newAttribute]);
      setCurrentCustomAttribute({
        key: '',
        type: 'text',
        unique: false,
      });
    }
  };

  const handleRemoveCustomAttribute = (index: number) => {
    setCustomAttributes(customAttributes.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: FunnelForm) => {
    if (isEditMode && funnelId) {
      // Modo edição - usar updateFunnel
      try {
        // Converter stages para o formato esperado pela API (array)
        const stagesArray: Array<{
          id?: number;
          name: string;
          position: number;
          color?: string;
          auto_assign?: boolean;
          description?: string;
        }> = [];

        if (currentFunnel?.stages) {
          if (Array.isArray(currentFunnel.stages)) {
            currentFunnel.stages.forEach((stage, index) => {
              stagesArray.push({
                id: stage.id,
                name: stage.name,
                position: stage.position,
                color: stage.color,
                auto_assign: false,
                description: stage.description,
              });
            });
          }
        }

        const payload = {
          name: data.name,
          description: data.description || undefined,
          stages: stagesArray,
          settings: {
            agents: selectedAgents,
          },
        };

        await dispatch(
          kanbanActions.updateFunnel({
            funnelId,
            payload,
          }),
        ).unwrap();

        navigation.goBack();
      } catch (error) {
        logger.error('Error updating funnel:', error);
      }
    } else {
      // Modo criação - usar createFunnel (código existente)
      const stagesObject: Record<string, { name: string; color: string; position: number; description?: string; auto_create_conditions?: unknown[] }> = {};

      stages.forEach((stage, index) => {
        const stageKey = stage.name
          .toLowerCase()
          .replace(/\s+/g, '_')
          .replace(/[^a-z0-9_]/g, '');
        stagesObject[stageKey] = {
          name: stage.name,
          color: stage.color,
          description: stage.description,
          position: index + 1,
          auto_create_conditions: stage.autoCreateConditions.map(condition => ({
            type: condition.type,
            value: condition.value,
          })),
        };
      });

      const payload = {
        name: data.name,
        description: data.description || '',
        active: isActive,
        stages: stagesObject,
        settings: {
          agents: selectedAgents,
        },
        global_custom_attributes: customAttributes.map(attr => ({
          name: attr.key,
          type: attr.type,
          unique: attr.unique,
        })),
      };

      try {
        await dispatch(kanbanActions.createFunnel(payload)).unwrap();
        navigation.goBack();
      } catch (error) {
        logger.error('Error creating funnel:', error);
      }
    }
  };

  const handleDiscard = () => {
    navigation.goBack();
  };

  const handleDeleteFunnel = () => {
    if (!isEditMode || !funnelId || !currentFunnel) return;

    Alert.alert(
      'Deletar Funil',
      `Tem certeza que deseja deletar o funil "${currentFunnel.name}"? Esta ação não pode ser desfeita.`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(kanbanActions.deleteFunnel(funnelId)).unwrap();
              showToast({ message: 'Funil deletado com sucesso' });
              navigation.goBack();
            } catch (error) {
              logger.error('Error deleting funnel:', error);
              showToast({ message: 'Erro ao deletar funil' });
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={tailwind.style('flex-1 bg-gray-50')}>
      <View
        style={tailwind.style(
          'bg-white px-4 py-3 border-b border-gray-200 flex-row items-center justify-between',
        )}>
        <Pressable onPress={handleDiscard}>
          <Text style={tailwind.style('text-blue-600')}>Descartar</Text>
        </Pressable>
        <Text style={tailwind.style('text-lg font-inter-semibold-20 text-gray-950')}>
          {isEditMode ? `Editando: ${currentFunnel?.name || ''}` : 'Criando: Novo Funil'}
        </Text>
        <Pressable onPress={handleSubmit(onSubmit)}>
          <Text style={tailwind.style('text-blue-600 font-inter-medium-24')}>Salvar</Text>
        </Pressable>
      </View>

      <ScrollView
        style={tailwind.style('flex-1')}
        contentContainerStyle={[
          tailwind.style('p-4'),
          { paddingBottom: Math.max(insets.bottom, 16) + 80 },
        ]}>
        <View style={tailwind.style('mb-6')}>
          <View style={tailwind.style('flex-row items-center mb-4')}>
            <Text style={tailwind.style('text-lg font-inter-semibold-20 text-gray-950')}>
              Dados Básicos
            </Text>
          </View>

          <View style={tailwind.style('mb-4')}>
            <View style={tailwind.style('flex-row items-center justify-between mb-2')}>
              <View style={tailwind.style('flex-1')}>
                <Text style={tailwind.style('text-base font-inter-medium-24 text-gray-950 mb-1')}>
                  Status Ativo
                </Text>
                <Text style={tailwind.style('text-sm text-gray-600')}>
                  Ativar ou desativar este funil. Funis desativados não aceitarão novos itens.
                </Text>
              </View>
              <Switch
                value={isActive}
                onValueChange={setIsActive}
                trackColor={{ false: '#767577', true: '#3B82F6' }}
                thumbColor={isActive ? '#fff' : '#f4f3f4'}
              />
            </View>
          </View>

          <Controller
            control={control}
            rules={{ required: 'Nome é obrigatório' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={tailwind.style('mb-4')}>
                <Text style={tailwind.style('text-base font-inter-medium-24 text-gray-950 mb-2')}>
                  Nome
                </Text>
                <TextInput
                  style={tailwind.style(
                    'text-base font-inter-normal-20 py-2 px-3 rounded-xl text-gray-950 bg-white border border-gray-300 h-10',
                  )}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Digite o nome do funil"
                  placeholderTextColor={tailwind.color('text-gray-500')}
                />
                {errors.name && (
                  <Text style={tailwind.style('text-red-600 text-sm mt-1')}>
                    {errors.name.message}
                  </Text>
                )}
              </View>
            )}
            name="name"
          />

          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={tailwind.style('mb-4')}>
                <Text style={tailwind.style('text-base font-inter-medium-24 text-gray-950 mb-2')}>
                  Descrição
                </Text>
                <TextInput
                  style={tailwind.style(
                    'text-base font-inter-normal-20 py-2 px-3 rounded-xl text-gray-950 bg-white border border-gray-300 min-h-20',
                  )}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Digite a descrição do funil"
                  placeholderTextColor={tailwind.color('text-gray-500')}
                  multiline
                  numberOfLines={3}
                />
              </View>
            )}
            name="description"
          />
        </View>

        <View style={tailwind.style('mb-6')}>
          <Text style={tailwind.style('text-lg font-inter-semibold-20 text-gray-950 mb-4')}>
            Crie uma nova etapa
          </Text>

          <View style={tailwind.style('mb-4')}>
            <Text style={tailwind.style('text-base font-inter-medium-24 text-gray-950 mb-2')}>
              Nome da etapa
            </Text>
            <TextInput
              style={tailwind.style(
                'text-base font-inter-normal-20 py-2 px-3 rounded-xl text-gray-950 bg-white border border-gray-300 h-10',
              )}
              value={currentStage.name}
              onChangeText={text => setCurrentStage({ ...currentStage, name: text })}
              placeholder="Nome da etapa"
              placeholderTextColor={tailwind.color('text-gray-500')}
            />
          </View>

          <View style={tailwind.style('mb-4')}>
            <Text style={tailwind.style('text-base font-inter-medium-24 text-gray-950 mb-2')}>
              Cor
            </Text>
            <View style={tailwind.style('flex-row items-center')}>
              <Pressable
                onPress={() => colorPickerRef.current?.present()}
                style={[
                  tailwind.style('w-12 h-12 rounded border border-gray-300 mr-3'),
                  { backgroundColor: currentStage.color },
                ]}
              />
              <Pressable
                onPress={() => colorPickerRef.current?.present()}
                style={tailwind.style(
                  'flex-1 text-base font-inter-normal-20 py-2 px-3 rounded-xl text-gray-950 bg-white border border-gray-300 h-10 items-center justify-center',
                )}>
                <Text style={tailwind.style('text-base font-inter-normal-20 text-gray-950')}>
                  {currentStage.color}
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={tailwind.style('mb-4')}>
            <Text style={tailwind.style('text-base font-inter-medium-24 text-gray-950 mb-2')}>
              Descrição
            </Text>
            <TextInput
              style={tailwind.style(
                'text-base font-inter-normal-20 py-2 px-3 rounded-xl text-gray-950 bg-white border border-gray-300 min-h-20',
              )}
              value={currentStage.description}
              onChangeText={text => setCurrentStage({ ...currentStage, description: text })}
              placeholder="Descrição da etapa"
              placeholderTextColor={tailwind.color('text-gray-500')}
              multiline
              numberOfLines={2}
            />
          </View>

          <View style={tailwind.style('mb-4')}>
            <View style={tailwind.style('flex-row items-center mb-2')}>
              <Text style={tailwind.style('text-base font-inter-medium-24 text-gray-950')}>
                Condições de Auto Criação
              </Text>
            </View>

            {currentStage.autoCreateConditions?.map((condition, index) => (
              <View key={index} style={tailwind.style('flex-row items-center mb-2')}>
                <View style={tailwind.style('flex-1 mr-2')}>
                  <TextInput
                    style={tailwind.style(
                      'text-base font-inter-normal-20 py-2 px-3 rounded-xl text-gray-950 bg-white border border-gray-300 h-10',
                    )}
                    value="Contato tem tag"
                    editable={false}
                    placeholderTextColor={tailwind.color('text-gray-500')}
                  />
                </View>
                <TextInput
                  style={tailwind.style(
                    'flex-1 text-base font-inter-normal-20 py-2 px-3 rounded-xl text-gray-950 bg-white border border-gray-300 h-10 mr-2',
                  )}
                  value={condition.value}
                  onChangeText={text => {
                    const updated = [...(currentStage.autoCreateConditions || [])];
                    updated[index].value = text;
                    setCurrentStage({ ...currentStage, autoCreateConditions: updated });
                  }}
                  placeholder="Tag"
                  placeholderTextColor={tailwind.color('text-gray-500')}
                />
                <Pressable
                  onPress={() => handleRemoveAutoCreateCondition(index)}
                  style={tailwind.style('w-10 h-10 items-center justify-center')}>
                  <Text style={tailwind.style('text-red-600 text-xl')}>×</Text>
                </Pressable>
              </View>
            ))}

            <Pressable
              onPress={handleAddAutoCreateCondition}
              style={tailwind.style(
                'w-10 h-10 bg-blue-600 rounded items-center justify-center mb-4',
              )}>
              <Text style={tailwind.style('text-white text-xl')}>+</Text>
            </Pressable>
          </View>

          <Pressable
            onPress={handleAddStage}
            style={tailwind.style('bg-blue-600 px-4 py-3 rounded-lg items-center mb-4')}>
            <Text style={tailwind.style('text-white font-inter-medium-24')}>Adicionar etapa</Text>
          </Pressable>
        </View>

        {stages.length > 0 && (
          <View style={tailwind.style('mb-6')}>
            <Pressable
              onPress={() => toggleSection('stages')}
              style={tailwind.style('flex-row items-center justify-between mb-4')}>
              <Text style={tailwind.style('text-lg font-inter-semibold-20 text-gray-950')}>
                Etapas desse funil ({stages.length})
              </Text>
              <Text style={tailwind.style('text-gray-600')}>
                {expandedSections.stages ? '▲' : '▼'}
              </Text>
            </Pressable>
            {expandedSections.stages && (
              <>
                {stages.map((stage, index) => (
                  <View
                    key={index}
                    style={tailwind.style(
                      'bg-white rounded-lg p-4 mb-2 border border-gray-200 flex-row items-center justify-between',
                    )}>
                    <View style={tailwind.style('flex-row items-center flex-1')}>
                      <View
                        style={[
                          tailwind.style('w-4 h-4 rounded-full mr-3'),
                          { backgroundColor: stage.color },
                        ]}
                      />
                      <Text
                        style={tailwind.style(
                          'text-base font-inter-medium-24 text-gray-950 flex-1',
                        )}>
                        {stage.name}
                      </Text>
                    </View>
                    <Pressable onPress={() => handleRemoveStage(index)}>
                      <Text style={tailwind.style('text-red-600')}>Remover</Text>
                    </Pressable>
                  </View>
                ))}
              </>
            )}
          </View>
        )}

        <View style={tailwind.style('mb-6')}>
          <Pressable
            onPress={() => toggleSection('agents')}
            style={tailwind.style('flex-row items-center justify-between mb-4')}>
            <Text style={tailwind.style('text-lg font-inter-semibold-20 text-gray-950')}>
              Agentes do Funil
            </Text>
            <Text style={tailwind.style('text-gray-600')}>
              {expandedSections.agents ? '▲' : '▼'}
            </Text>
          </Pressable>
          {expandedSections.agents && (
            <>
              {Array.isArray(availableAgents) && availableAgents.length > 0 ? (
                <>
                  {availableAgents.map(agent => (
                    <Pressable
                      key={agent.id}
                      onPress={() => handleToggleAgent(agent.id)}
                      style={tailwind.style(
                        'bg-white rounded-lg p-4 mb-2 border border-gray-200 flex-row items-center justify-between',
                      )}>
                      <View style={tailwind.style('flex-row items-center flex-1')}>
                        <View
                          style={tailwind.style(
                            'w-8 h-8 rounded-full bg-blue-500 items-center justify-center mr-3',
                          )}>
                          <Text style={tailwind.style('text-white text-xs')}>
                            {(agent.name || agent.availableName || agent.email || '?').charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View style={tailwind.style('flex-1')}>
                          <Text
                            style={tailwind.style('text-base font-inter-medium-24 text-gray-950')}>
                            {agent.name || agent.availableName || agent.email || 'Agente sem nome'}
                          </Text>
                          {agent.email && (
                          <Text style={tailwind.style('text-sm text-gray-600')}>{agent.email}</Text>
                          )}
                        </View>
                      </View>
                      <Switch
                        value={selectedAgents.includes(agent.id)}
                        onValueChange={() => handleToggleAgent(agent.id)}
                        trackColor={{ false: '#767577', true: '#3B82F6' }}
                        thumbColor={selectedAgents.includes(agent.id) ? '#fff' : '#f4f3f4'}
                      />
                    </Pressable>
                  ))}
                </>
              ) : (
                <Text style={tailwind.style('text-gray-500 text-center py-4')}>
                  Nenhum agente disponível
                </Text>
              )}
            </>
          )}
        </View>

        <View style={tailwind.style('mb-6')}>
          <Pressable
            onPress={() => toggleSection('messageTemplates')}
            style={tailwind.style('flex-row items-center justify-between mb-4')}>
            <Text style={tailwind.style('text-lg font-inter-semibold-20 text-gray-950')}>
              Modelos de Mensagem (0)
            </Text>
            <Text style={tailwind.style('text-gray-600')}>
              {expandedSections.messageTemplates ? '▲' : '▼'}
            </Text>
          </Pressable>
          {expandedSections.messageTemplates && (
            <Text style={tailwind.style('text-gray-500 text-center py-4')}>
              Nenhum modelo de mensagem adicionado
            </Text>
          )}
        </View>

        <View style={tailwind.style('mb-6')}>
          <Pressable
            onPress={() => toggleSection('customAttributes')}
            style={tailwind.style('flex-row items-center justify-between mb-4')}>
            <Text style={tailwind.style('text-lg font-inter-semibold-20 text-gray-950')}>
              Campos Personalizados Globais
            </Text>
            <Text style={tailwind.style('text-gray-600')}>
              {expandedSections.customAttributes ? '▲' : '▼'}
            </Text>
          </Pressable>
          {expandedSections.customAttributes && (
            <>
              {customAttributes.map((attr, index) => (
                <View
                  key={index}
                  style={tailwind.style(
                    'bg-white rounded-lg p-4 mb-2 border border-gray-200 flex-row items-center',
                  )}>
                  <View style={tailwind.style('flex-1 mr-2')}>
                    <TextInput
                      style={tailwind.style(
                        'text-base font-inter-normal-20 py-2 px-3 rounded-xl text-gray-950 bg-gray-50 border border-gray-300 h-10 mb-2',
                      )}
                      value={attr.key}
                      editable={false}
                      placeholder="Chave (name)"
                      placeholderTextColor={tailwind.color('text-gray-500')}
                    />
                    <View style={tailwind.style('flex-row items-center')}>
                      <TextInput
                        style={tailwind.style(
                          'flex-1 text-base font-inter-normal-20 py-2 px-3 rounded-xl text-gray-950 bg-gray-50 border border-gray-300 h-10 mr-2',
                        )}
                        value={attr.type}
                        editable={false}
                        placeholder="Tipo"
                        placeholderTextColor={tailwind.color('text-gray-500')}
                      />
                      <View style={tailwind.style('flex-row items-center mr-2')}>
                        <Switch
                          value={attr.unique}
                          onValueChange={value => {
                            const updated = [...customAttributes];
                            updated[index].unique = value;
                            setCustomAttributes(updated);
                          }}
                          trackColor={{ false: '#767577', true: '#3B82F6' }}
                          thumbColor={attr.unique ? '#fff' : '#f4f3f4'}
                        />
                        <Text style={tailwind.style('text-sm text-gray-600 ml-2')}>Único</Text>
                      </View>
                      <Pressable onPress={() => handleRemoveCustomAttribute(index)}>
                        <Text style={tailwind.style('text-red-600 text-xl')}>×</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              ))}

              <View style={tailwind.style('mb-4')}>
                <Text style={tailwind.style('text-base font-inter-medium-24 text-gray-950 mb-2')}>
                  Chave (name)
                </Text>
                <TextInput
                  style={tailwind.style(
                    'text-base font-inter-normal-20 py-2 px-3 rounded-xl text-gray-950 bg-white border border-gray-300 h-10 mb-2',
                  )}
                  value={currentCustomAttribute.key}
                  onChangeText={text =>
                    setCurrentCustomAttribute({ ...currentCustomAttribute, key: text })
                  }
                  placeholder="Chave (name)"
                  placeholderTextColor={tailwind.color('text-gray-500')}
                />
                <View style={tailwind.style('flex-row items-center')}>
                  <TextInput
                    style={tailwind.style(
                      'flex-1 text-base font-inter-normal-20 py-2 px-3 rounded-xl text-gray-950 bg-white border border-gray-300 h-10 mr-2',
                    )}
                    value={currentCustomAttribute.type}
                    onChangeText={text =>
                      setCurrentCustomAttribute({ ...currentCustomAttribute, type: text })
                    }
                    placeholder="Tipo"
                    placeholderTextColor={tailwind.color('text-gray-500')}
                  />
                  <View style={tailwind.style('flex-row items-center')}>
                    <Switch
                      value={currentCustomAttribute.unique || false}
                      onValueChange={value =>
                        setCurrentCustomAttribute({ ...currentCustomAttribute, unique: value })
                      }
                      trackColor={{ false: '#767577', true: '#3B82F6' }}
                      thumbColor={currentCustomAttribute.unique ? '#fff' : '#f4f3f4'}
                    />
                    <Text style={tailwind.style('text-sm text-gray-600 ml-2')}>Único</Text>
                  </View>
                </View>
              </View>

              <Pressable
                onPress={handleAddCustomAttribute}
                style={tailwind.style('bg-blue-600 px-4 py-3 rounded-lg items-center mb-2')}>
                <Text style={tailwind.style('text-white font-inter-medium-24')}>
                  Adicionar campo
                </Text>
              </Pressable>
            </>
          )}
        </View>
        {/* Botão de deletar - apenas em modo edição */}
        {isEditMode && funnelId && (
          <View style={tailwind.style('px-4 pb-4 border-t border-gray-200')}>
            <Pressable
              onPress={handleDeleteFunnel}
              style={tailwind.style('bg-red-600 px-4 py-3 rounded-lg items-center mt-4')}>
              <Text style={tailwind.style('text-white font-inter-medium-24')}>Deletar Funil</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      <ColorPicker
        color={currentStage.color || '#FF6B6B'}
        onColorChange={color => setCurrentStage({ ...currentStage, color })}
        sheetRef={colorPickerRef}
      />
    </SafeAreaView>
  );
};
