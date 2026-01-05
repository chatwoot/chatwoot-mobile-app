import { useAppDispatch, useAppSelector } from '@/hooks';
import { selectUserId } from '@/store/auth/authSelectors';
import { contactConversationActions } from '@/store/contact/contactConversationActions';
import { selectAllContacts } from '@/store/contact/contactSelectors';
import { conversationActions } from '@/store/conversation/conversationActions';
import { inboxActions } from '@/store/inbox/inboxActions';
import { selectAllInboxes } from '@/store/inbox/inboxSelectors';
import { kanbanActions } from '@/store/kanban/kanbanActions';
import {
    selectCurrentKanbanFunnel,
    selectKanbanFunnels,
    selectKanbanItemById,
} from '@/store/kanban/kanbanSelectors';
import type {
    CreateKanbanItemPayload,
    KanbanStage as KanbanStageType,
} from '@/store/kanban/kanbanTypes';
import { tailwind } from '@/theme';
import { logger } from '@/utils/logger';
import { showToast } from '@/utils/toastUtils';
import DateTimePicker, {
    DateTimePickerAndroid,
    type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { StackActions, useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    FlatList,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Switch,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

interface ItemForm {
  title: string;
  description: string;
}

interface RouteParams {
  funnelId?: number;
  stageId?: number;
  stageKey?: string;
  itemId?: number; // Adicionar itemId para modo edição
}

type TabType = 'geral' | 'pipeline' | 'atribuicao' | 'agendamento' | 'relacionamentos' | 'dados';

const PRIORITY_OPTIONS = [
  { value: 'none', label: 'Nenhuma', color: '#6B7280' },
  { value: 'low', label: 'Baixa', color: '#10B981' },
  { value: 'medium', label: 'Média', color: '#F59E0B' },
  { value: 'high', label: 'Alta', color: '#EF4444' },
  { value: 'urgent', label: 'Urgente', color: '#DC2626' },
] as const;

const CURRENCY_OPTIONS = [
  { code: 'BRL', symbol: 'R$', locale: 'pt-BR', label: 'R$ BRL' },
  { code: 'USD', symbol: '$', locale: 'en-US', label: '$ USD' },
  { code: 'EUR', symbol: '€', locale: 'en-GB', label: '€ EUR' },
] as const;

export const CreateKanbanItemScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const timeoutRefs = React.useRef<ReturnType<typeof setTimeout>[]>([]);
  const params = (route.params as RouteParams) || {};
  const {
    funnelId: initialFunnelId,
    stageKey: initialStageKey,
    itemId, // Adicionar itemId
  } = params;

  const isEditMode = !!itemId; // Verificar se está em modo edição

  // Se estiver em modo edição, buscar o item
  const existingItem = useAppSelector(state =>
    itemId ? selectKanbanItemById(state, itemId) : null,
  );

  const funnels = useAppSelector(selectKanbanFunnels);
  const currentFunnel = useAppSelector(selectCurrentKanbanFunnel);
  const contacts = useAppSelector(selectAllContacts);
  const inboxes = useAppSelector(selectAllInboxes);
  const currentUserId = useAppSelector(selectUserId);
  const accountAgents = useAppSelector(state => state.kanban?.accountAgents || []);

  const availableAgents = useMemo(() => {
    if (accountAgents.length > 0) {
      return accountAgents.map((a: any) => ({
        id: a.id,
        name: a.name || a.availableName || a.email || 'Agente',
        email: a.email,
        role: a.role,
      }));
    }
    return currentFunnel?.settings?.agents || [];
  }, [accountAgents, currentFunnel]);

  const [activeTab, setActiveTab] = useState<TabType>('geral');
  const [hasValue, setHasValue] = useState(false);
  const [offerDescription, setOfferDescription] = useState('');
  const [value, setValue] = useState('');
  const [selectedCurrency] = useState(CURRENCY_OPTIONS[0]);
  const [selectedFunnelId, setSelectedFunnelId] = useState(initialFunnelId);
  const [selectedStageKey, setSelectedStageKey] = useState(initialStageKey || '');
  const [priority, setPriority] = useState<string>('none');
  const [selectedAgents, setSelectedAgents] = useState<number[]>([]);
  const [isScheduled, setIsScheduled] = useState(false);
  const [schedulingType, setSchedulingType] = useState<'deadline' | 'schedule'>('deadline');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [scheduledDateTime, setScheduledDateTime] = useState('');
  const [linkContact, setLinkContact] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<number | null>(null);
  const [selectedInboxId, setSelectedInboxId] = useState<number | null>(null);
  const [useContactNameAsTitle, setUseContactNameAsTitle] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showFunnelModal, setShowFunnelModal] = useState(false);
  const [showStageModal, setShowStageModal] = useState(false);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [customAttributes] = useState<Record<string, unknown>>({});
  const [agentSearchQuery, setAgentSearchQuery] = useState('');

  // Filtrar agentes
  const filteredAgents = useMemo(() => {
    if (!agentSearchQuery) return availableAgents;
    const lowerQuery = agentSearchQuery.toLowerCase();
    return availableAgents.filter(
      (a: { name: string; email: string }) =>
        (a.name && a.name.toLowerCase().includes(lowerQuery)) ||
        (a.email && a.email.toLowerCase().includes(lowerQuery)),
    );
  }, [availableAgents, agentSearchQuery]);

  // Adicionar estados para DateTimePicker
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);
  const [showSchedulePicker, setShowSchedulePicker] = useState(false);
  const [deadlineDateValue, setDeadlineDateValue] = useState(new Date());
  const [scheduleDateValue, setScheduleDateValue] = useState(new Date());

  // Função para obter o nome do contato selecionado
  const getContactDisplayName = useCallback(
    (contactId: number | null): string => {
      if (!contactId) return 'Selecione um contato';

      try {
        const contact = contacts?.find(c => c?.id === contactId);
        if (contact) {
          return contact.name || contact.identifier || contact.email || `Contato #${contactId}`;
        }
        return `Contato #${contactId}`;
      } catch (error) {
        logger.error('Error rendering contact name:', error);
        return `Contato #${contactId}`;
      }
    },
    [contacts],
  );

  // Função para obter o nome do contato selecionado
  const getSelectedContactName = useCallback(
    (contactId: number | null): string | null => {
      if (!contactId) return null;

      try {
        const contact = contacts?.find(c => c?.id === contactId);
        if (contact) {
          return contact.name || contact.identifier || contact.email || null;
        }
        return null;
      } catch (error) {
        logger.error('Error getting contact name:', error);
        return null;
      }
    },
    [contacts],
  );

  // Adicionar formatDateBR e formatDateTimeISO
  const formatDateBR = useCallback((date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }, []);

  const formatDateTimeISO = useCallback((date: Date) => {
    return date.toISOString().slice(0, 16);
  }, []);

  // Adicionar handlers para DateTimePicker
  const handleDeadlineDateChange = useCallback(
    (event: DateTimePickerEvent, selectedDate?: Date) => {
      if (Platform.OS !== 'ios') return;
      if (event.type !== 'dismissed' && selectedDate) {
        setDeadlineDateValue(selectedDate);
        setDeadlineDate(formatDateBR(selectedDate));
      }
    },
    [formatDateBR],
  );

  const handleScheduleDateChange = useCallback(
    (event: DateTimePickerEvent, selectedDate?: Date) => {
      if (Platform.OS !== 'ios') return;
      if (event.type !== 'dismissed' && selectedDate) {
        setScheduleDateValue(selectedDate);
        setScheduledDateTime(formatDateTimeISO(selectedDate));
      }
    },
    [formatDateTimeISO],
  );

  const openDeadlinePickerAndroid = useCallback(() => {
    DateTimePickerAndroid.open({
      value: deadlineDateValue,
      mode: 'date',
      minimumDate: new Date(),
      onChange: (event, date) => {
        if (event.type === 'dismissed' || !date) return;
        setDeadlineDateValue(date);
        setDeadlineDate(formatDateBR(date));
      },
    });
  }, [deadlineDateValue, formatDateBR]);

  const openSchedulePickerAndroid = useCallback(() => {
    DateTimePickerAndroid.open({
      value: scheduleDateValue,
      mode: 'date',
      minimumDate: new Date(),
      onChange: (event, date) => {
        if (event.type === 'dismissed' || !date) return;
        DateTimePickerAndroid.open({
          value: date,
          mode: 'time',
          is24Hour: true,
          onChange: (timeEvent, timeDate) => {
            if (timeEvent.type === 'dismissed' || !timeDate) return;
            const finalDate = new Date(date);
            finalDate.setHours(timeDate.getHours(), timeDate.getMinutes(), 0, 0);
            setScheduleDateValue(finalDate);
            setScheduledDateTime(formatDateTimeISO(finalDate));
          },
        });
      },
    });
  }, [scheduleDateValue, formatDateTimeISO]);

  // Atualizar o useForm para usar valores do item existente se estiver editando
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue: setFormValue,
  } = useForm<ItemForm>({
    defaultValues: {
      title: existingItem?.title || '',
      description: existingItem?.description || '',
    },
  });

  // Efeito para carregar dados do item quando entrar em modo edição
  useEffect(() => {
    if (isEditMode && itemId) {
      dispatch(kanbanActions.getKanbanItem(itemId));
    }
  }, [isEditMode, itemId, dispatch]);

  // Efeito para preencher formulário quando o item for carregado
  useEffect(() => {
    if (existingItem) {
      reset({
        title: existingItem.title || '',
        description: existingItem.description || '',
      });
      // Preencher outros campos
      if (existingItem.priority) setPriority(existingItem.priority);
      if (existingItem.due_date) setDeadlineDate(existingItem.due_date);
      if (existingItem.stage_key) setSelectedStageKey(existingItem.stage_key);
      if (existingItem.funnel_id) setSelectedFunnelId(existingItem.funnel_id);
      if (existingItem.assigned_agents?.length) {
        setSelectedAgents(existingItem.assigned_agents.map(a => a.id));
      }
    }
  }, [existingItem, reset]);

  useEffect(() => {
    if (initialFunnelId) {
      dispatch(kanbanActions.getFunnel(initialFunnelId));
    }
    // Buscar conversas para popular os contatos (os contatos vêm das conversas via listener)
    dispatch(
      conversationActions.fetchConversations({
        status: 'open',
        assigneeType: 'all',
        page: 1,
        sortBy: 'latest',
        inboxId: 0,
      }),
    );
    // Carregar inboxes para poder criar conversas
    dispatch(inboxActions.fetchInboxes());
    // Carregar agentes da conta
    dispatch(kanbanActions.getAccountAgents());
  }, [dispatch, initialFunnelId]);

  useEffect(() => {
    if (selectedFunnelId && selectedFunnelId !== currentFunnel?.id) {
      dispatch(kanbanActions.getFunnel(selectedFunnelId));
    }
  }, [dispatch, selectedFunnelId, currentFunnel?.id]);

  // Efeito para atualizar o título quando a opção de usar nome do contato estiver ativa
  useEffect(() => {
    if (useContactNameAsTitle && selectedContactId) {
      const contactName = getSelectedContactName(selectedContactId);
      if (contactName) {
        setFormValue('title', contactName);
      }
    }
  }, [useContactNameAsTitle, selectedContactId, getSelectedContactName, setFormValue]);

  const handleDiscard = () => {
    navigation.goBack();
  };

  const getStagesFromFunnel = () => {
    if (!currentFunnel?.stages) return [];
    if (Array.isArray(currentFunnel.stages)) {
      return currentFunnel.stages;
    }
    return Object.entries(currentFunnel.stages).map(([key, stage]) => ({
      ...(stage as KanbanStageType),
      stage_key: key,
    }));
  };

  const stages = getStagesFromFunnel();

  // Atualizar a função onSubmit
  const onSubmit = async (data: ItemForm) => {
    if (!selectedFunnelId || !selectedStageKey) {
      showToast({ message: 'Por favor, selecione um funil e uma etapa' });
      return;
    }

    const selectedFunnel = funnels?.find((f: { id: number }) => f.id === selectedFunnelId);
    if (!selectedFunnel) {
      showToast({ message: 'Funnel não encontrado' });
      return;
    }

    // Se a opção de usar nome do contato estiver ativa, usar o nome do contato como título
    let finalTitle = data.title;
    if (useContactNameAsTitle && selectedContactId) {
      const contactName = getSelectedContactName(selectedContactId);
      if (contactName) {
        finalTitle = contactName;
      }
    }

    const itemDetails: CreateKanbanItemPayload['kanban_item']['item_details'] = {
      title: finalTitle,
      description: data.description || undefined,
      priority: priority !== 'none' ? priority : undefined,
    };

    if (hasValue && value) {
      itemDetails.currency = {
        symbol: selectedCurrency.symbol,
        code: selectedCurrency.code,
        locale: selectedCurrency.locale,
      };
    }

    if (isScheduled) {
      if (schedulingType === 'deadline' && deadlineDate) {
        itemDetails.deadline_at = deadlineDate;
        itemDetails.scheduling_type = 'deadline';
      } else if (schedulingType === 'schedule' && scheduledDateTime) {
        itemDetails.scheduled_at = scheduledDateTime;
        itemDetails.scheduling_type = 'schedule';
      }
    }

    // Se um contato foi selecionado, buscar conversas do contato e usar a primeira conversa aberta
    let conversationIdToLink: number | undefined = undefined;
    if (linkContact && selectedContactId) {
      try {
        const contactConversationsResult = await dispatch(
          contactConversationActions.getContactConversations({ contactId: selectedContactId }),
        ).unwrap();

        // Buscar a primeira conversa aberta (status 'open')
        const openConversation = contactConversationsResult.conversations.find(
          conv => conv.status === 'open',
        );

        if (openConversation) {
          conversationIdToLink = openConversation.id;
        } else if (contactConversationsResult.conversations.length > 0) {
          // Se não houver conversa aberta, usar a primeira conversa disponível
          conversationIdToLink = contactConversationsResult.conversations[0].id;
        }
        // Se não houver conversas, conversationIdToLink permanece undefined
        // e o item será criado sem vinculação (o chamado será criado depois)

        // Atribuir o agente atual à conversa, se houver conversa e agente atual
        if (conversationIdToLink && currentUserId) {
          try {
            await dispatch(
              conversationActions.assignConversation({
                conversationId: conversationIdToLink,
                assigneeId: currentUserId,
              }),
            ).unwrap();
          } catch (assignError) {
            logger.error('Error assigning conversation to agent:', assignError);
            // Continuar mesmo se falhar na atribuição
          }
        }
      } catch (error) {
        logger.error('Error fetching contact conversations:', error);
        // Continuar sem vincular conversa
      }
    }

    if (conversationIdToLink) {
      itemDetails.conversation_id = conversationIdToLink;
    }

    if (Object.keys(customAttributes).length > 0) {
      itemDetails.custom_attributes = customAttributes;
    }

    const position = 1;
    const payload: CreateKanbanItemPayload = {
      kanban_item: {
        funnel_id: selectedFunnelId.toString(),
        funnel_stage: selectedStageKey,
        position,
        assigned_agents: selectedAgents.length > 0 ? selectedAgents : undefined,
        conversation_display_id: conversationIdToLink,
        item_details: itemDetails,
      },
    };

    try {
      if (isEditMode && itemId) {
        // Modo edição - usar updateKanbanItem
        await dispatch(
          kanbanActions.updateKanbanItem({
            itemId,
            payload: {
              title: data.title,
              description: data.description,
              stage_id: selectedStageKey ? parseInt(selectedStageKey) : undefined,
              priority: priority !== 'none' ? priority : undefined,
              due_date: deadlineDate || undefined,
            },
          }),
        ).unwrap();
        showToast({ message: 'Item atualizado com sucesso' });
      } else {
        // Modo criação - usar createKanbanItem (código existente)
        await dispatch(kanbanActions.createKanbanItem(payload)).unwrap();
        showToast({ message: 'Item criado com sucesso' });

        // Se um contato foi selecionado e uma conversa foi encontrada, navegar para ela
        if (linkContact && selectedContactId && conversationIdToLink) {
          try {
            // Pequeno delay para garantir que o item foi salvo
            const timeout = setTimeout(() => {
              navigation.dispatch(
                StackActions.push('ChatScreen', {
                  conversationId: conversationIdToLink,
                }),
              );
            }, 300);
            timeoutRefs.current.push(timeout);
            return; // Não fazer goBack() aqui, pois vamos navegar para a conversa
          } catch (error) {
            logger.error('Error navigating to conversation:', error);
          }
        }
      }
      navigation.goBack();
    } catch (error: unknown) {
      logger.error('Error creating item:', error);
      const errorMessage =
        typeof error === 'string'
          ? error
          : error && typeof error === 'object' && 'message' in error
            ? String(error.message)
            : 'Erro ao criar item';
      showToast({ message: errorMessage });
    }
  };

  const tabs: { key: TabType; label: string }[] = [
    { key: 'geral', label: 'Geral' },
    { key: 'pipeline', label: 'Pipeline' },
    { key: 'atribuicao', label: 'Atribuição' },
    { key: 'agendamento', label: 'Agendamento' },
    { key: 'relacionamentos', label: 'Relacionamentos' },
    { key: 'dados', label: 'Dados Adicionais' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'geral':
        return (
          <View style={tailwind.style('p-4')}>
            <View style={tailwind.style('mb-6')}>
              <Text style={tailwind.style('text-base font-inter-medium-24 text-gray-950 mb-2')}>
                Título *
              </Text>
              <Controller
                control={control}
                name="title"
                rules={{ required: 'Título é obrigatório' }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="Digite o título do item"
                    placeholderTextColor={tailwind.color('text-gray-500')}
                    style={tailwind.style(
                      'bg-white border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-950 font-inter-normal-20',
                    )}
                  />
                )}
              />
              {errors.title && (
                <Text style={tailwind.style('text-red-600 text-sm mt-1')}>
                  {errors.title.message}
                </Text>
              )}
            </View>

            <View style={tailwind.style('mb-6')}>
              <View style={tailwind.style('flex-row items-center justify-between mb-2')}>
                <Text style={tailwind.style('text-base font-inter-medium-24 text-gray-950')}>
                  Valor
                </Text>
                <View style={tailwind.style('flex-row items-center')}>
                  <Text style={tailwind.style('text-sm text-gray-600 mr-2')}>Possui valor</Text>
                  <Switch
                    value={hasValue}
                    onValueChange={setHasValue}
                    trackColor={{ false: '#767577', true: '#3B82F6' }}
                    thumbColor={hasValue ? '#fff' : '#f4f3f4'}
                  />
                </View>
              </View>
              {hasValue && (
                <>
                  <TextInput
                    value={offerDescription}
                    onChangeText={setOfferDescription}
                    placeholder="Descrição da oferta"
                    placeholderTextColor={tailwind.color('text-gray-500')}
                    style={tailwind.style(
                      'bg-white border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-950 font-inter-normal-20 mb-3',
                    )}
                  />
                  <View style={tailwind.style('flex-row items-center')}>
                    <TextInput
                      value={value}
                      onChangeText={setValue}
                      placeholder="Digite o valor"
                      placeholderTextColor={tailwind.color('text-gray-500')}
                      keyboardType="numeric"
                      style={tailwind.style(
                        'bg-white border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-950 font-inter-normal-20 flex-1',
                      )}
                    />
                    <Text style={tailwind.style('text-lg text-gray-950 mx-2')}>
                      {selectedCurrency.symbol}
                    </Text>
                    <Pressable
                      style={tailwind.style(
                        'bg-white border border-gray-300 rounded-lg px-3 py-3 min-w-[80px]',
                      )}>
                      <Text style={tailwind.style('text-base text-gray-950 text-center')}>
                        {selectedCurrency.code}
                      </Text>
                    </Pressable>
                  </View>
                </>
              )}
            </View>

            <View style={tailwind.style('mb-6')}>
              <Text style={tailwind.style('text-base font-inter-medium-24 text-gray-950 mb-2')}>
                Descrição
              </Text>
              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="Digite a descrição do item"
                    placeholderTextColor={tailwind.color('text-gray-500')}
                    multiline
                    numberOfLines={4}
                    style={tailwind.style(
                      'bg-white border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-950 font-inter-normal-20',
                    )}
                    textAlignVertical="top"
                  />
                )}
              />
            </View>
          </View>
        );

      case 'pipeline':
        return (
          <View style={tailwind.style('p-4')}>
            <View style={tailwind.style('mb-6')}>
              <Text style={tailwind.style('text-base font-inter-medium-24 text-gray-950 mb-2')}>
                Funil
              </Text>
              <Pressable
                onPress={() => setShowFunnelModal(true)}
                style={tailwind.style(
                  'bg-white border border-gray-300 rounded-lg px-4 py-3 flex-row items-center justify-between',
                )}>
                <Text style={tailwind.style('text-base text-gray-950')}>
                  {selectedFunnelId
                    ? funnels?.find((f: { id: number }) => f.id === selectedFunnelId)?.name ||
                      'Selecione um funil'
                    : 'Selecione um funil'}
                </Text>
                <Text style={tailwind.style('text-gray-500')}>▼</Text>
              </Pressable>
            </View>

            <View style={tailwind.style('mb-6')}>
              <Text style={tailwind.style('text-base font-inter-medium-24 text-gray-950 mb-2')}>
                Estágio Atual
              </Text>
              <Pressable
                onPress={() => setShowStageModal(true)}
                style={tailwind.style(
                  'bg-white border border-gray-300 rounded-lg px-4 py-3 flex-row items-center justify-between',
                )}>
                <Text style={tailwind.style('text-base text-gray-950')}>
                  {selectedStageKey
                    ? stages.find(
                        (s: KanbanStageType) =>
                          s.stage_key === selectedStageKey || s.id.toString() === selectedStageKey,
                      )?.name || 'Selecione um estágio'
                    : 'Selecione um estágio'}
                </Text>
                <Text style={tailwind.style('text-gray-500')}>▼</Text>
              </Pressable>
            </View>
          </View>
        );

      case 'atribuicao':
        return (
          <View style={tailwind.style('p-4')}>
            <View style={tailwind.style('mb-6')}>
              <Text style={tailwind.style('text-base font-inter-medium-24 text-gray-950 mb-2')}>
                Prioridade
              </Text>
              <View style={tailwind.style('flex-row flex-wrap gap-2')}>
                {PRIORITY_OPTIONS.map(option => (
                  <Pressable
                    key={option.value}
                    onPress={() => setPriority(option.value)}
                    style={tailwind.style(
                      `px-4 py-2 rounded-lg border ${
                        priority === option.value
                          ? 'bg-blue-600 border-blue-600'
                          : 'bg-white border-gray-300'
                      }`,
                    )}>
                    <Text
                      style={tailwind.style(
                        `font-inter-medium-24 ${
                          priority === option.value ? 'text-white' : 'text-gray-950'
                        }`,
                      )}>
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={tailwind.style('mb-6')}>
              <Text style={tailwind.style('text-base font-inter-medium-24 text-gray-950 mb-2')}>
                Agente Atribuído
              </Text>
              <Pressable
                onPress={() => setShowAgentModal(true)}
                style={tailwind.style(
                  'bg-white border border-gray-300 rounded-lg px-4 py-3 flex-row items-center justify-between',
                )}>
                <Text style={tailwind.style('text-base text-gray-950')}>
                  {selectedAgents.length > 0
                    ? availableAgents
                        .filter((a: { id: number }) => selectedAgents.includes(a.id))
                        .map((a: { name: string }) => a.name)
                        .join(', ')
                    : 'Selecione um agente'}
                </Text>
                <Text style={tailwind.style('text-gray-500')}>▼</Text>
              </Pressable>
            </View>
          </View>
        );

      case 'agendamento':
        return (
          <View style={tailwind.style('px-4 pt-2 pb-2')}>
            <View style={tailwind.style('mb-4')}>
              <View style={tailwind.style('flex-row items-center justify-between mb-3')}>
                <Text style={tailwind.style('text-xs text-gray-600')}>Agendar</Text>
                <Switch
                  value={isScheduled}
                  onValueChange={setIsScheduled}
                  trackColor={{ false: '#767577', true: '#3B82F6' }}
                  thumbColor={isScheduled ? '#fff' : '#f4f3f4'}
                />
              </View>

              {isScheduled && (
                <>
                  <View style={tailwind.style('flex-row gap-2 mb-3')}>
                    <Pressable
                      onPress={() => setSchedulingType('deadline')}
                      style={tailwind.style(
                        `flex-1 py-2 px-3 rounded-lg border ${
                          schedulingType === 'deadline'
                            ? 'bg-blue-600 border-blue-600'
                            : 'bg-white border-gray-300'
                        }`,
                      )}>
                      <Text
                        style={tailwind.style(
                          `text-xs text-center font-inter-medium-24 ${
                            schedulingType === 'deadline' ? 'text-white' : 'text-gray-950'
                          }`,
                        )}>
                        Prazo
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setSchedulingType('schedule')}
                      style={tailwind.style(
                        `flex-1 py-2 px-3 rounded-lg border ${
                          schedulingType === 'schedule'
                            ? 'bg-blue-600 border-blue-600'
                            : 'bg-white border-gray-300'
                        }`,
                      )}>
                      <Text
                        style={tailwind.style(
                          `text-xs text-center font-inter-medium-24 ${
                            schedulingType === 'schedule' ? 'text-white' : 'text-gray-950'
                          }`,
                        )}>
                        Agendar com horário
                      </Text>
                    </Pressable>
                  </View>

                  {schedulingType === 'deadline' ? (
                    <>
                      <Pressable
                        onPress={() =>
                          Platform.OS === 'ios'
                            ? setShowDeadlinePicker(true)
                            : openDeadlinePickerAndroid()
                        }
                        style={tailwind.style(
                          'bg-white border border-gray-300 rounded-lg px-3 py-2.5 flex-row items-center justify-between',
                        )}>
                        <Text
                          style={tailwind.style(
                            `text-sm font-inter-normal-20 ${
                              deadlineDate ? 'text-gray-950' : 'text-gray-500'
                            }`,
                          )}>
                          {deadlineDate || 'Selecione uma data'}
                        </Text>
                        <Text style={tailwind.style('text-gray-500 text-xs')}>📅</Text>
                      </Pressable>
                      {Platform.OS === 'ios' && showDeadlinePicker && (
                        <View style={tailwind.style('mt-2')}>
                          <DateTimePicker
                            value={deadlineDateValue}
                            mode="date"
                            display="spinner"
                            onChange={handleDeadlineDateChange}
                            minimumDate={new Date()}
                            locale="pt-BR"
                          />
                          <Pressable
                            onPress={() => setShowDeadlinePicker(false)}
                            style={tailwind.style(
                              'mt-2 bg-gray-200 px-4 py-2 rounded-lg items-center',
                            )}>
                            <Text
                              style={tailwind.style('text-sm font-inter-medium-24 text-gray-950')}>
                              Confirmar
                            </Text>
                          </Pressable>
                        </View>
                      )}
                    </>
                  ) : (
                    <>
                      <Pressable
                        onPress={() =>
                          Platform.OS === 'ios'
                            ? setShowSchedulePicker(true)
                            : openSchedulePickerAndroid()
                        }
                        style={tailwind.style(
                          'bg-white border border-gray-300 rounded-lg px-3 py-2.5 flex-row items-center justify-between',
                        )}>
                        <Text
                          style={tailwind.style(
                            `text-sm font-inter-normal-20 ${
                              scheduledDateTime ? 'text-gray-950' : 'text-gray-500'
                            }`,
                          )}>
                          {scheduledDateTime
                            ? formatDateBR(new Date(scheduledDateTime)) +
                              ' ' +
                              new Date(scheduledDateTime).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Selecione data e hora'}
                        </Text>
                        <Text style={tailwind.style('text-gray-500 text-xs')}>📅</Text>
                      </Pressable>
                      {Platform.OS === 'ios' && showSchedulePicker && (
                        <View style={tailwind.style('mt-2')}>
                          <DateTimePicker
                            value={scheduleDateValue}
                            mode="datetime"
                            display="spinner"
                            onChange={handleScheduleDateChange}
                            minimumDate={new Date()}
                            locale="pt-BR"
                          />
                          <Pressable
                            onPress={() => setShowSchedulePicker(false)}
                            style={tailwind.style(
                              'mt-2 bg-gray-200 px-4 py-2 rounded-lg items-center',
                            )}>
                            <Text
                              style={tailwind.style('text-sm font-inter-medium-24 text-gray-950')}>
                              Confirmar
                            </Text>
                          </Pressable>
                        </View>
                      )}
                    </>
                  )}
                </>
              )}
            </View>
          </View>
        );

      case 'relacionamentos':
        return (
          <View style={tailwind.style('px-4 pt-2 pb-2')}>
            <View style={tailwind.style('mb-2')}>
              <View style={tailwind.style('flex-row items-center justify-between mb-3')}>
                <Text style={tailwind.style('text-xs text-gray-600')}>Vincular a um contato</Text>
                <Switch
                  value={linkContact}
                  onValueChange={value => {
                    setLinkContact(value);
                    if (!value) {
                      setSelectedContactId(null);
                      setSelectedInboxId(null);
                    }
                  }}
                  trackColor={{ false: '#767577', true: '#3B82F6' }}
                  thumbColor={linkContact ? '#fff' : '#f4f3f4'}
                />
              </View>

              {linkContact && (
                <>
                  <Pressable
                    onPress={() => {
                      try {
                        if (contacts && Array.isArray(contacts) && contacts.length > 0) {
                          setShowContactModal(true);
                        } else {
                          showToast({ message: 'Nenhum contato disponível' });
                        }
                      } catch (error) {
                        logger.error('Error opening contact modal:', error);
                        showToast({ message: 'Erro ao abrir lista de contatos' });
                      }
                    }}
                    style={tailwind.style(
                      'bg-white border border-gray-300 rounded-lg px-3 py-2.5 flex-row items-center justify-between mb-2',
                    )}>
                    <Text style={tailwind.style('text-sm text-gray-950')}>
                      {getContactDisplayName(selectedContactId)}
                    </Text>
                    <Text style={tailwind.style('text-gray-500 text-xs')}>▼</Text>
                  </Pressable>

                  {/* Opção para atribuir o nome do contato ao título do item */}
                  {selectedContactId && (
                    <View style={tailwind.style('mb-3')}>
                      <View style={tailwind.style('flex-row items-center justify-between')}>
                        <Text style={tailwind.style('text-xs text-gray-600 flex-1 mr-2')}>
                          Atribuir o nome do contato ao título do item
                        </Text>
                        <Switch
                          value={useContactNameAsTitle}
                          onValueChange={value => {
                            setUseContactNameAsTitle(value);
                            if (value && selectedContactId) {
                              const contactName = getSelectedContactName(selectedContactId);
                              if (contactName) {
                                setFormValue('title', contactName);
                              }
                            }
                          }}
                          trackColor={{ false: '#767577', true: '#3B82F6' }}
                          thumbColor={useContactNameAsTitle ? '#fff' : '#f4f3f4'}
                        />
                      </View>
                    </View>
                  )}
                </>
              )}
            </View>
          </View>
        );

      case 'dados':
        return (
          <View style={tailwind.style('px-4 pt-2 pb-2')}>
            <View style={tailwind.style('mb-2')}>
              <Text style={tailwind.style('text-xs text-gray-600 mb-1.5')}>Campos Globais</Text>
              <Text style={tailwind.style('text-xs text-gray-500')}>
                {currentFunnel?.global_custom_attributes?.length
                  ? `${currentFunnel.global_custom_attributes.length} campo(s) definido(s)`
                  : 'Nenhum campo global definido para este funil'}
              </Text>
            </View>

            <View style={tailwind.style('mb-6')}>
              <Text style={tailwind.style('text-base font-inter-medium-24 text-gray-950 mb-2')}>
                Campos Adicionais
              </Text>
              <Text style={tailwind.style('text-sm text-gray-500 mb-4')}>
                Campos personalizados podem ser adicionados aqui
              </Text>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={tailwind.style('flex-1 bg-gray-50')}>
      <View
        style={tailwind.style(
          'bg-white px-4 py-3 border-b border-gray-200 flex-row items-center justify-between',
        )}>
        <Pressable onPress={handleDiscard}>
          <Text style={tailwind.style('text-blue-600 font-inter-medium-24')}>Cancelar</Text>
        </Pressable>
        <Text style={tailwind.style('text-lg font-inter-semibold-20 text-gray-950')}>
          {isEditMode ? 'Editando Item' : 'Criando: Novo Item'}
        </Text>
        <Pressable onPress={handleSubmit(onSubmit)}>
          <Text style={tailwind.style('text-blue-600 font-inter-medium-24')}>Salvar</Text>
        </Pressable>
      </View>

      <View style={tailwind.style('border-b border-gray-200')}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={tailwind.style('px-2')}
          style={tailwind.style('h-12')}>
          {tabs.map(tab => (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={tailwind.style(
                `px-3 py-1.5 border-b-2 h-full justify-center ${
                  activeTab === tab.key ? 'border-blue-600' : 'border-transparent'
                }`,
              )}>
              <Text
                style={tailwind.style(
                  `text-sm font-inter-medium-24 ${
                    activeTab === tab.key ? 'text-blue-600' : 'text-gray-600'
                  }`,
                )}>
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={tailwind.style('flex-1')}
        contentContainerStyle={[
          tailwind.style('pb-4'),
          { paddingBottom: Math.max(insets.bottom, 16) + 80 },
        ]}>
        {renderTabContent()}
      </ScrollView>

      <Modal
        visible={showContactModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowContactModal(false)}>
        <View style={tailwind.style('flex-1 bg-black/50 justify-end')}>
          <View style={tailwind.style('bg-white rounded-t-3xl max-h-[80%]')}>
            <View
              style={tailwind.style(
                'px-4 py-3 border-b border-gray-200 flex-row items-center justify-between',
              )}>
              <Text style={tailwind.style('text-lg font-inter-semibold-20 text-gray-950')}>
                Selecionar Contato
              </Text>
              <Pressable onPress={() => setShowContactModal(false)}>
                <Text style={tailwind.style('text-blue-600 font-inter-medium-24')}>Fechar</Text>
              </Pressable>
            </View>
            <FlatList
              data={contacts?.slice(0, 50) || []}
              keyExtractor={(item, index) => item?.id?.toString() ?? `contact-${index}`}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    setSelectedContactId(item.id);
                    // Selecionar o primeiro inbox disponível como padrão
                    if (inboxes && inboxes.length > 0 && !selectedInboxId) {
                      setSelectedInboxId(inboxes[0].id);
                    }
                    // Atribuir automaticamente o agente atual se estiver disponível nos agentes do funil
                    if (currentUserId && availableAgents.some((a: { id: number }) => a.id === currentUserId)) {
                      if (!selectedAgents.includes(currentUserId)) {
                        setSelectedAgents([currentUserId]);
                      }
                    }
                    setShowContactModal(false);
                  }}
                  style={tailwind.style('px-4 py-3 border-b border-gray-100')}>
                  <Text style={tailwind.style('text-base text-gray-950')}>
                    {item.name || item.identifier || item.email || `Contato #${item.id}`}
                  </Text>
                  {item.email && (
                    <Text style={tailwind.style('text-sm text-gray-500 mt-1')}>{item.email}</Text>
                  )}
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={showFunnelModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFunnelModal(false)}>
        <View style={tailwind.style('flex-1 bg-black/50 justify-end')}>
          <View style={tailwind.style('bg-white rounded-t-3xl max-h-[80%]')}>
            <View
              style={tailwind.style(
                'px-4 py-3 border-b border-gray-200 flex-row items-center justify-between',
              )}>
              <Text style={tailwind.style('text-lg font-inter-semibold-20 text-gray-950')}>
                Selecionar Funil
              </Text>
              <Pressable onPress={() => setShowFunnelModal(false)}>
                <Text style={tailwind.style('text-blue-600 font-inter-medium-24')}>Fechar</Text>
              </Pressable>
            </View>
            <FlatList
              data={funnels || []}
              keyExtractor={(item, index) => item?.id?.toString() ?? `funnel-${index}`}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    setSelectedFunnelId(item.id);
                    setSelectedStageKey('');
                    setShowFunnelModal(false);
                  }}
                  style={tailwind.style('px-4 py-3 border-b border-gray-100')}>
                  <Text style={tailwind.style('text-base text-gray-950')}>{item.name}</Text>
                  {item.description && (
                    <Text style={tailwind.style('text-sm text-gray-500 mt-1')}>
                      {item.description}
                    </Text>
                  )}
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={showStageModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStageModal(false)}>
        <View style={tailwind.style('flex-1 bg-black/50 justify-end')}>
          <View style={tailwind.style('bg-white rounded-t-3xl max-h-[80%]')}>
            <View
              style={tailwind.style(
                'px-4 py-3 border-b border-gray-200 flex-row items-center justify-between',
              )}>
              <Text style={tailwind.style('text-lg font-inter-semibold-20 text-gray-950')}>
                Selecionar Estágio
              </Text>
              <Pressable onPress={() => setShowStageModal(false)}>
                <Text style={tailwind.style('text-blue-600 font-inter-medium-24')}>Fechar</Text>
              </Pressable>
            </View>
            <FlatList
              data={stages}
              keyExtractor={(item, index) => item?.stage_key ?? item?.id?.toString() ?? `stage-${index}`}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    setSelectedStageKey(item.stage_key || item.id.toString());
                    setShowStageModal(false);
                  }}
                  style={tailwind.style('px-4 py-3 border-b border-gray-100')}>
                  <View style={tailwind.style('flex-row items-center')}>
                    {item.color && (
                      <View
                        style={[
                          tailwind.style('w-3 h-3 rounded-full mr-2'),
                          { backgroundColor: item.color },
                        ]}
                      />
                    )}
                    <Text style={tailwind.style('text-base text-gray-950')}>{item.name}</Text>
                  </View>
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={showAgentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAgentModal(false)}>
        <View style={tailwind.style('flex-1 bg-black/50 justify-end')}>
          <View style={tailwind.style('bg-white rounded-t-3xl max-h-[80%] flex-1')}>
            <View
              style={tailwind.style(
                'px-4 py-3 border-b border-gray-200 flex-row items-center justify-between',
              )}>
              <Text style={tailwind.style('text-lg font-inter-semibold-20 text-gray-950')}>
                Selecionar Agente(s)
              </Text>
              <Pressable onPress={() => setShowAgentModal(false)}>
                <Text style={tailwind.style('text-blue-600 font-inter-medium-24')}>Fechar</Text>
              </Pressable>
            </View>
            <View style={tailwind.style('p-2 border-b border-gray-100')}>
              <TextInput
                value={agentSearchQuery}
                onChangeText={setAgentSearchQuery}
                placeholder="Buscar agente..."
                placeholderTextColor={tailwind.color('text-gray-500')}
                style={tailwind.style(
                  'bg-gray-100 rounded-lg px-3 py-2 text-base text-gray-950 font-inter-normal-20',
                )}
              />
            </View>
            {filteredAgents.length === 0 ? (
              <View style={tailwind.style('flex-1 items-center justify-center p-8')}>
                <Text style={tailwind.style('text-sm text-gray-500')}>
                  Nenhum agente disponível
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredAgents}
                keyExtractor={(item, index) => item?.id?.toString() ?? `agent-${index}`}
                renderItem={({ item }) => {
                  const isSelected = selectedAgents.includes(item.id);
                  return (
                    <Pressable
                      onPress={() => {
                        if (isSelected) {
                          setSelectedAgents(selectedAgents.filter(id => id !== item.id));
                        } else {
                          setSelectedAgents([...selectedAgents, item.id]);
                        }
                      }}
                      style={tailwind.style(
                        `px-4 py-3 border-b border-gray-100 flex-row items-center justify-between ${
                          isSelected ? 'bg-blue-50' : ''
                        }`,
                      )}>
                      <Text style={tailwind.style('text-base text-gray-950')}>{item.name}</Text>
                      {isSelected && <Text style={tailwind.style('text-blue-600')}>✓</Text>}
                    </Pressable>
                  );
                }}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* DateTimePicker para Android - Deadline */}
      {Platform.OS === 'android' && showDeadlinePicker && (
        <DateTimePicker
          value={deadlineDateValue}
          mode="date"
          display="default"
          onChange={handleDeadlineDateChange}
          minimumDate={new Date()}
        />
      )}

      {/* DateTimePicker para Android - Schedule */}
      {Platform.OS === 'android' && showSchedulePicker && (
        <DateTimePicker
          value={scheduleDateValue}
          mode="datetime"
          display="default"
          onChange={handleScheduleDateChange}
          minimumDate={new Date()}
        />
      )}
    </SafeAreaView>
  );
};
