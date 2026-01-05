import { BottomSheetBackdrop, BottomSheetWrapper } from '@/components-next';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { kanbanActions } from '@/store/kanban/kanbanActions';
import { selectCurrentKanbanFunnel, selectKanbanFunnels } from '@/store/kanban/kanbanSelectors';
import type { KanbanItem } from '@/store/kanban/kanbanTypes';
import { tailwind } from '@/theme';
import { showToast } from '@/utils/toastUtils';
import {
  BottomSheetModal,
  BottomSheetScrollView,
  useBottomSheetSpringConfigs,
} from '@gorhom/bottom-sheet';
import React, { useCallback, useEffect, useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';

interface NextStageModalProps {
  kanbanItem: KanbanItem;
  conversationId: number;
}

export const NextStageModal = React.forwardRef<BottomSheetModal, NextStageModalProps>(
  ({ kanbanItem, conversationId }, ref) => {
    const dispatch = useAppDispatch();
    const currentFunnel = useAppSelector(selectCurrentKanbanFunnel);
    const allFunnels = useAppSelector(selectKanbanFunnels);

    // Buscar o funnel do item
    const funnel = useMemo(() => {
      if (currentFunnel?.id === kanbanItem.funnel_id) {
        return currentFunnel;
      }
      return allFunnels.find(f => f.id === kanbanItem.funnel_id);
    }, [currentFunnel, allFunnels, kanbanItem.funnel_id]);

    // Carregar o funnel se não estiver carregado
    useEffect(() => {
      if (!funnel && kanbanItem.funnel_id) {
        dispatch(kanbanActions.getFunnel(kanbanItem.funnel_id));
      }
    }, [dispatch, funnel, kanbanItem.funnel_id]);

    const animationConfigs = useBottomSheetSpringConfigs({
      mass: 1,
      stiffness: 420,
      damping: 30,
    });

    const snapPoints = useMemo(() => ['60%'], []);

    // Obter stages disponíveis (excluindo o stage atual)
    const availableStages = useMemo(() => {
      if (!funnel?.stages || !Array.isArray(funnel.stages)) return [];

      const currentStageKey = kanbanItem.stage_key || kanbanItem.funnel_stage;
      return funnel.stages.filter(stage => stage.stage_key !== currentStageKey && stage.stage_key);
    }, [funnel?.stages, kanbanItem.stage_key, kanbanItem.funnel_stage]);

    const handleSelectStage = useCallback(
      async (stageKey: string) => {
        if (!funnel?.id) return;

        try {
          await dispatch(
            kanbanActions.moveKanbanItemToStage({
              itemId: kanbanItem.id,
              funnelStage: stageKey,
              funnelId: funnel.id,
            }),
          ).unwrap();

          showToast({ message: 'Item movido para próxima etapa com sucesso' });
          (ref as React.RefObject<BottomSheetModal>).current?.dismiss();
        } catch (error: any) {
          showToast({
            message: error.response?.data?.message || 'Erro ao mover item para próxima etapa',
          });
        }
      },
      [dispatch, kanbanItem.id, funnel?.id, ref],
    );

    return (
      <BottomSheetModal
        ref={ref}
        backdropComponent={BottomSheetBackdrop}
        handleIndicatorStyle={tailwind.style('bg-gray-300 w-12 h-1')}
        enablePanDownToClose
        animationConfigs={animationConfigs}
        snapPoints={snapPoints}>
        <BottomSheetWrapper>
          <BottomSheetScrollView
            style={tailwind.style('flex-1')}
            contentContainerStyle={tailwind.style('px-4 pb-4')}>
            <View style={tailwind.style('mb-6')}>
              <Text style={tailwind.style('text-xl font-inter-semibold-20 text-gray-950 mb-2')}>
                Mover
              </Text>
              <Text style={tailwind.style('text-sm text-gray-600')}>
                Selecione para qual etapa deseja mover esta conversa
              </Text>
            </View>

            {availableStages.length === 0 ? (
              <View style={tailwind.style('bg-gray-50 rounded-lg p-4 items-center')}>
                <Text style={tailwind.style('text-sm text-gray-500')}>
                  Não há etapas disponíveis
                </Text>
              </View>
            ) : (
              <View style={tailwind.style('gap-2')}>
                {availableStages.map(stage => (
                  <Pressable
                    key={stage.id}
                    onPress={() => handleSelectStage(stage.stage_key!)}
                    style={tailwind.style(
                      'bg-white rounded-lg p-4 border border-gray-200 active:bg-gray-50',
                    )}>
                    <View style={tailwind.style('flex-row items-center')}>
                      {/* <View
                        style={tailwind.style('w-4 h-4 rounded-full mr-3')}
                        style={[
                          tailwind.style('w-4 h-4 rounded-full mr-3'),
                          { backgroundColor: stage.color || '#3B82F6' },
                        ]}
                      /> */}
                      <View
                        style={[
                          tailwind.style('w-4 h-4 rounded-full mr-3'),
                          { backgroundColor: stage.color || '#3B82F6' },
                        ]}
                      />
                      <View style={tailwind.style('flex-1')}>
                        <Text
                          style={tailwind.style('text-base font-inter-medium-24 text-gray-950')}>
                          {stage.name}
                        </Text>
                        {stage.description && (
                          <Text style={tailwind.style('text-sm text-gray-600 mt-1')}>
                            {stage.description}
                          </Text>
                        )}
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}
          </BottomSheetScrollView>
        </BottomSheetWrapper>
      </BottomSheetModal>
    );
  },
);

NextStageModal.displayName = 'NextStageModal';
