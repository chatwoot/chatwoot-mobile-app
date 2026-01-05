import { BottomSheetBackdrop, BottomSheetWrapper } from '@/components-next';
import { useAppDispatch, useAppSelector } from '@/hooks';
import {
    MODAL_SNAP_POINTS,
    RELOAD_DELAYS
} from '@/screens/kanban/constants';
import { useAgentAssignment } from '@/screens/kanban/hooks/useAgentAssignment';
import { useContactLinking } from '@/screens/kanban/hooks/useContactLinking';
import { useItemSync } from '@/screens/kanban/hooks/useItemSync';
import { useKanbanItemForm } from '@/screens/kanban/hooks/useKanbanItemForm';
import { useScheduling } from '@/screens/kanban/hooks/useScheduling';
import { selectAllContacts } from '@/store/contact/contactSelectors';
import { kanbanActions } from '@/store/kanban/kanbanActions';
import {
    selectCurrentKanbanFunnel,
    selectKanbanFunnels
} from '@/store/kanban/kanbanSelectors';
import type { UpdateKanbanItemPayload } from '@/store/kanban/kanbanTypes';
import { tailwind } from '@/theme';
import { logger } from '@/utils/logger';
import { showToast } from '@/utils/toastUtils';
import { BottomSheetModal, useBottomSheetSpringConfigs } from '@gorhom/bottom-sheet';
import Clipboard from '@react-native-clipboard/clipboard';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { AssignmentTab } from './edit-item-modal/AssignmentTab';
import { DataTab } from './edit-item-modal/DataTab';
import { GeneralTab } from './edit-item-modal/GeneralTab';
import { ItemFormProvider } from './edit-item-modal/ItemFormContext';
import { RelationshipsTab } from './edit-item-modal/RelationshipsTab';
import { SchedulingTab } from './edit-item-modal/SchedulingTab';
import { TabNavigation, TabType } from './edit-item-modal/TabNavigation';

interface EditItemModalProps {
  itemId: number | null;
  funnelId: number;
  sheetRef: React.RefObject<BottomSheetModal>;
  onClose: () => void;
  onItemUpdated?: () => void;
  onItemUpdateStart?: () => void;
  initialItem?: any;
}

export const EditItemModal: React.FC<EditItemModalProps> = ({
  itemId,
  funnelId,
  sheetRef,
  onClose,
  onItemUpdated,
  onItemUpdateStart,
  initialItem,
}) => {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<TabType>('geral');
  const [selectedFunnelId, setSelectedFunnelId] = useState(funnelId);
  const [selectedStageKey, setSelectedStageKey] = useState('');
  const [priority, setPriority] = useState<string>('none');
  const [selectedAgents, setSelectedAgents] = useState<number[]>([]);
  const [showFunnelModal, setShowFunnelModal] = useState(false);
  const [showStageModal, setShowStageModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // --- Hooks ----
  const { item, isLoading: isLoadingItem } = useItemSync({ itemId, initialItem });
  
  const { form, setValue: setFormValue } = useKanbanItemForm({ item, itemId });

  const {
    assignAgent,
    removeAgent,
    isAssigning,
    isRemoving,
  } = useAgentAssignment({
    item,
    funnelId,
    onSuccess: onItemUpdated,
  });

  const {
    isScheduled,
    setIsScheduled,
    schedulingType,
    setSchedulingType,
    deadlineDate,
    setDeadlineDate,
    scheduledDateTime,
    setScheduledDateTime,
    openDeadlinePickerAndroid,
    openSchedulePickerAndroid,
    deadlineDateValue,
    scheduleDateValue,
    handleDeadlineDateChange,
    handleScheduleDateChange,
    setDeadlineDateFromISO,
    setScheduledDateFromISO,
  } = useScheduling();

  const {
    linkContact,
    setLinkContact,
    selectedContactId,
    setSelectedContactId,
    useContactNameAsTitle,
    setUseContactNameAsTitle,
    getConversationIdForContact,
  } = useContactLinking();

  // --- Selectors ---
  const currentFunnel = useAppSelector(selectCurrentKanbanFunnel);
  const funnels = useAppSelector(selectKanbanFunnels);
  const accountAgents = useAppSelector(state => state.kanban?.accountAgents || []);
  const contacts = useAppSelector(selectAllContacts);

  // --- Memos ---
  const snapPoints = useMemo(() => [...MODAL_SNAP_POINTS.EDIT_ITEM], []);
  
  const animationConfigs = useBottomSheetSpringConfigs({
    mass: 1,
    stiffness: 420,
    damping: 30,
  });

  const availableAgents = useMemo(() => {
    if (accountAgents.length > 0) {
      return accountAgents.map(a => ({
        id: a.id,
        name: a.name || a.availableName || a.email || 'Agente',
        email: a.email
      }));
    }
    return currentFunnel?.settings?.agents || [];
  }, [accountAgents, currentFunnel]);

  const stages = useMemo(() => {
    if (!currentFunnel?.stages) return [];
    if (Array.isArray(currentFunnel.stages)) return currentFunnel.stages;
    if (typeof currentFunnel.stages === 'object') {
      return Object.entries(currentFunnel.stages).map(([key, value]) => ({
        stage_key: key,
        ...(value as any),
      }));
    }
    return [];
  }, [currentFunnel]);

  // --- Effects ---
  useEffect(() => {
    if (item) {
      // Sync local state when item loads
      if (item.priority) setPriority(item.priority);
      if (item.funnel_id) setSelectedFunnelId(item.funnel_id);
      if (item.stage_key || item.funnel_stage) setSelectedStageKey(item.stage_key || item.funnel_stage || '');
      
      // Agents
      if (item.assigned_agents) {
        setSelectedAgents(item.assigned_agents.map(a => a.id));
      }

      // Date
      if (item.due_date) {
        setDeadlineDateFromISO && setDeadlineDateFromISO(item.due_date); // Supondo que add setFromISO no hook
      }

      // Contact
      if (item.conversation?.contact?.id) {
        setLinkContact(true);
        setSelectedContactId(item.conversation.contact.id);
      }
    }
  }, [item]);

  useEffect(() => {
    if (useContactNameAsTitle && selectedContactId) {
      const contact = contacts.find(c => c.id === selectedContactId);
      if (contact) {
         setFormValue('title', contact.name || contact.email || '');
      }
    }
  }, [useContactNameAsTitle, selectedContactId]);

  // --- Handlers ---
  const handleSave = async (data: any) => {
    if (!itemId) return;
    setIsSaving(true);
    if (onItemUpdateStart) onItemUpdateStart();

    try {
      // Logic from monolithic component refactored here
       const stage = stages.find(s => s.stage_key === selectedStageKey || s.id?.toString() === selectedStageKey);

       let conversationIdToLink = item?.conversation_id;
       if (linkContact && selectedContactId) {
          const cid = await getConversationIdForContact(selectedContactId);
          if (cid) conversationIdToLink = cid;
       }

       const payload: UpdateKanbanItemPayload = {
        item_details: {
          title: data.title,
          description: data.description,
          conversation_id: conversationIdToLink,
        },
        stage_id: stage?.id,
        priority: priority !== 'none' ? priority : undefined,
        due_date: deadlineDate || undefined,
        conversation_id: conversationIdToLink,
      };

      await dispatch(kanbanActions.updateKanbanItem({ itemId, payload })).unwrap();
      
      // Delays safe update
      await new Promise(r => setTimeout(r, RELOAD_DELAYS.ITEM));
      if (funnelId) await dispatch(kanbanActions.getFunnel(funnelId));

      // Handle Agents (using the hook calls manually for now to batch)
      // Note: Ideal would be to batch in backend, but keeping logic
       if (selectedAgents.length > 0 || (item?.assigned_agents && item.assigned_agents.length > 0)) {
         const currentIds = item?.assigned_agents?.map(a => a.id) || [];
         const toAdd = selectedAgents.filter(id => !currentIds.includes(id));
         const toRemove = currentIds.filter(id => !selectedAgents.includes(id));

         for (const id of toRemove) await removeAgent(id);
         for (const id of toAdd) await assignAgent(id);
       }

      showToast({ message: 'Item atualizado com sucesso' });
      if (onItemUpdated) onItemUpdated();
      onClose();
      sheetRef.current?.dismiss();

    } catch (e) {
      logger.error('Error saving item', e);
      showToast({ message: 'Erro ao salvar item' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyId = () => {
    if (itemId) {
      Clipboard.setString(itemId.toString());
      showToast({ message: 'ID copiado' });
    }
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'geral': 
        return <GeneralTab 
          priority={priority}
          setPriority={setPriority}
          selectedStageKey={selectedStageKey}
          stages={stages}
          showStageModal={showStageModal}
          setShowStageModal={setShowStageModal}
          selectedFunnelId={selectedFunnelId}
          funnels={funnels}
          showFunnelModal={showFunnelModal}
          setShowFunnelModal={setShowFunnelModal}
        />;
      case 'atribuicao':
        return <AssignmentTab 
          assignedAgents={item?.assigned_agents || []}
          availableAgents={availableAgents}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedAgents={selectedAgents}
          handleToggleAgent={(id) => {
            setSelectedAgents(prev => 
              prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
            );
          }}
          isSaving={isSaving}
        />;
      case 'agendamento':
        return <SchedulingTab 
          isScheduled={isScheduled}
          setIsScheduled={setIsScheduled}
          schedulingType={schedulingType}
          setSchedulingType={setSchedulingType}
          deadlineDate={deadlineDate}
          setDeadlineDate={setDeadlineDate}
          scheduledDateTime={scheduledDateTime}
          setScheduledDateTime={setScheduledDateTime}
          openDeadlinePicker={openDeadlinePickerAndroid}
          openSchedulePicker={openSchedulePickerAndroid}
        />;
      case 'relacionamentos':
        return <RelationshipsTab 
          linkContact={linkContact}
          setLinkContact={setLinkContact}
          selectedContactId={selectedContactId}
          selectedContactName={contacts.find(c => c.id === selectedContactId)?.name || null}
          onChangeContact={() => { /* TODO: Open contact picker */ setShowFunnelModal(false); /* Placeholder */}}
          useContactNameAsTitle={useContactNameAsTitle}
          setUseContactNameAsTitle={setUseContactNameAsTitle}
        />;
      case 'dados':
        return <DataTab />;
      default: return null;
    }
  };

  return (
    <BottomSheetModal
      ref={sheetRef}
      index={0}
      snapPoints={snapPoints}
      animationConfigs={animationConfigs}
      enablePanDownToClose
      onDismiss={onClose}
      backdropComponent={BottomSheetBackdrop}>
      <BottomSheetWrapper>
        <ItemFormProvider form={form} item={item} isLoading={isLoadingItem} isSaving={isSaving}>
          <View style={tailwind.style('flex-1')}>
             <View style={tailwind.style('flex-row justify-between px-4 py-4 items-center border-b border-gray-200')}>
                <View style={tailwind.style('flex-row items-center')}>
                  <Text style={tailwind.style('text-lg font-inter-semibold-20 text-gray-900')}>
                    Editar Cartão
                  </Text>
                  <Pressable onPress={handleCopyId} style={tailwind.style('ml-2 bg-gray-100 px-2 py-0.5 rounded')}>
                     <Text style={tailwind.style('text-xs text-gray-500')}>#{itemId}</Text>
                  </Pressable>
                </View>
                <Pressable onPress={() => sheetRef.current?.dismiss()}>
                  <Text style={tailwind.style('text-gray-500 text-lg')}>✕</Text>
                </Pressable>
             </View>

             <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
             
             <View style={tailwind.style('flex-1')}>
                {renderContent()}
             </View>

             <View style={tailwind.style('p-4 border-t border-gray-200 bg-white')}>
                <Pressable
                  onPress={form.handleSubmit(handleSave)}
                  disabled={isSaving}
                  style={tailwind.style('bg-blue-600 rounded-lg py-3 items-center', isSaving ? 'opacity-70' : '')}>
                  {isSaving ? (
                     <Text style={tailwind.style('text-white font-inter-medium-24')}>Salvando...</Text>
                  ) : (
                     <Text style={tailwind.style('text-white font-inter-medium-24')}>Salvar Alterações</Text>
                  )}
                </Pressable>
             </View>
          </View>
        </ItemFormProvider>
      </BottomSheetWrapper>
    </BottomSheetModal>
  );
};
