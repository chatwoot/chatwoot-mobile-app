import { BottomSheetBackdrop, BottomSheetWrapper, ColorPicker } from '@/components-next';
import { Icon } from '@/components-next';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { kanbanActions } from '@/store/kanban/kanbanActions';
import { selectCurrentKanbanFunnel } from '@/store/kanban/kanbanSelectors';
import type {
  CreateFunnelPayload,
  KanbanStage as KanbanStageType,
} from '@/store/kanban/kanbanTypes';
import { tailwind } from '@/theme';
import { logger } from '@/utils/logger';
import { showToast } from '@/utils/toastUtils';
import { BottomSheetModal, useBottomSheetSpringConfigs } from '@gorhom/bottom-sheet';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { Trash } from '@/svg-icons/common';

interface EditStageModalProps {
  stage: KanbanStageType | null;
  funnelId: number;
  sheetRef: React.RefObject<BottomSheetModal>;
  onClose: () => void;
  onSuccess?: () => void;
}

interface StageForm {
  name: string;
  description: string;
  color: string;
}

export const EditStageModal: React.FC<EditStageModalProps> = ({
  stage,
  funnelId,
  sheetRef,
  onClose,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const currentFunnel = useAppSelector(selectCurrentKanbanFunnel);
  const colorPickerRef = useRef<BottomSheetModal>(null);
  const [color, setColor] = useState('#00FF00');

  const animationConfigs = useBottomSheetSpringConfigs({
    mass: 1,
    stiffness: 420,
    damping: 30,
  });

  const snapPoints = useMemo(() => ['60%'], []);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<StageForm>({
    defaultValues: {
      name: '',
      description: '',
      color: '#00FF00',
    },
  });

  useEffect(() => {
    if (stage) {
      reset({
        name: stage.name || '',
        description: stage.description || '',
        color: stage.color || '#00FF00',
      });
      setColor(stage.color || '#00FF00');
    }
  }, [stage, reset]);

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    setValue('color', newColor);
  };

  const onSubmit = async (data: StageForm) => {
    if (!stage || !currentFunnel) return;

    try {
      // Buscar o funnel atual para obter todos os stages
      const funnel = await dispatch(kanbanActions.getFunnel(funnelId)).unwrap();

      if (!funnel.stages || !Array.isArray(funnel.stages)) {
        showToast({ message: 'Erro ao carregar etapas do funil' });
        return;
      }

      // Criar objeto de stages atualizado
      const stagesObject: Record<
        string,
        {
          name: string;
          color: string;
          position: number;
          description?: string;
          auto_create_conditions?: {
            type: string;
            value: string;
          }[];
        }
      > = {};

      // Converter stages array para objeto, atualizando o stage específico
      funnel.stages.forEach(s => {
        const stageKey =
          s.stage_key ||
          s.name
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_]/g, '');

        if (s.id === stage.id) {
          // Atualizar o stage sendo editado
          stagesObject[stageKey] = {
            name: data.name,
            color: data.color,
            position: s.position,
            description: data.description || undefined,
            // Preservar auto_create_conditions se existirem
            auto_create_conditions: (s as KanbanStageType & { auto_create_conditions?: unknown[] }).auto_create_conditions || [],
          };
        } else {
          // Manter outros stages como estão
          stagesObject[stageKey] = {
            name: s.name,
            color: s.color || '#FF6B6B',
            position: s.position,
            description: s.description || undefined,
            auto_create_conditions: (s as KanbanStageType & { auto_create_conditions?: unknown[] }).auto_create_conditions || [],
          };
        }
      });

      // Criar payload de update do funnel
      const updatePayload: CreateFunnelPayload = {
        name: funnel.name,
        description: funnel.description,
        active: funnel.active ?? true,
        stages: stagesObject,
        settings: funnel.settings
          ? {
              agents: (funnel.settings.agents || []).map((a: { id?: number } | number) => (typeof a === 'object' && a.id ? a.id : a)),
            }
          : undefined,
        global_custom_attributes: funnel.global_custom_attributes || [],
      };

      // Atualizar o funnel
      await dispatch(
        kanbanActions.updateFunnel({
          funnelId,
          payload: updatePayload,
        }),
      ).unwrap();

      // Recarregar o funnel para refletir as mudanças
      await dispatch(kanbanActions.getFunnel(funnelId)).unwrap();

      showToast({ message: 'Etapa atualizada com sucesso' });
      sheetRef.current?.dismiss();
      onSuccess?.();
      onClose();
    } catch (error) {
      logger.error('Error updating stage:', error);
      showToast({ message: 'Erro ao atualizar etapa' });
    }
  };

  const handleDeleteStage = async () => {
    if (!stage || !currentFunnel) return;

    Alert.alert(
      'Excluir Etapa',
      `Tem certeza que deseja excluir a etapa "${stage.name}"? Esta ação não pode ser desfeita.`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              // Buscar o funnel atual para obter todos os stages
              const funnel = await dispatch(kanbanActions.getFunnel(funnelId)).unwrap();

              if (!funnel.stages || !Array.isArray(funnel.stages)) {
                showToast({ message: 'Erro ao carregar etapas do funil' });
                return;
              }

              // Criar objeto de stages sem a etapa a ser excluída
              const stagesObject: Record<
                string,
                {
                  name: string;
                  color: string;
                  position: number;
                  description?: string;
                  auto_create_conditions?: {
                    type: string;
                    value: string;
                  }[];
                }
              > = {};

              // Filtrar o stage que será excluído
              funnel.stages
                .filter(s => s.id !== stage.id)
                .forEach(s => {
                  const stageKey =
                    s.stage_key ||
                    s.name
                      .toLowerCase()
                      .replace(/\s+/g, '_')
                      .replace(/[^a-z0-9_]/g, '');

                  stagesObject[stageKey] = {
                    name: s.name,
                    color: s.color || '#FF6B6B',
                    position: s.position,
                    description: s.description || undefined,
                    auto_create_conditions: (s as { auto_create_conditions?: { type: string; value: string }[] })
                      .auto_create_conditions || [],
                  };
                });

              // Criar payload de update do funnel
              const updatePayload: CreateFunnelPayload = {
                name: funnel.name,
                description: funnel.description,
                active: funnel.active ?? true,
                stages: stagesObject,
                settings: funnel.settings
                  ? {
                      agents: (funnel.settings.agents || []).map((a: { id?: number }) => a.id || (a as number)),
                    }
                  : undefined,
              };

              // Atualizar o funnel
              await dispatch(
                kanbanActions.updateFunnel({
                  funnelId,
                  payload: updatePayload as never,
                }),
              ).unwrap();

              // Recarregar o funnel para refletir as mudanças
              await dispatch(kanbanActions.getFunnel(funnelId)).unwrap();

              showToast({ message: 'Etapa excluída com sucesso' });
              sheetRef.current?.dismiss();
              onSuccess?.();
              onClose();
            } catch (error) {
              logger.error('Error deleting stage:', error);
              const errorMessage =
                (error as { message?: string; response?: { data?: { message?: string } } })?.message ||
                (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                'Erro ao excluir etapa';
              showToast({ message: errorMessage });
            }
          },
        },
      ],
    );
  };

  const handleClose = () => {
    sheetRef.current?.dismiss();
    onClose();
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };

  return (
    <>
      <BottomSheetModal
        ref={sheetRef}
        backdropComponent={BottomSheetBackdrop}
        handleIndicatorStyle={tailwind.style('overflow-hidden bg-blackA-A6 w-8 h-1 rounded-[11px]')}
        handleStyle={tailwind.style('p-0 h-4 pt-[5px]')}
        style={tailwind.style('rounded-[26px] overflow-hidden')}
        animationConfigs={animationConfigs}
        enablePanDownToClose
        snapPoints={snapPoints}>
        <BottomSheetWrapper>
          <View style={tailwind.style('px-4 pb-6')}>
            {/* Header */}
            <View style={tailwind.style('flex-row items-center justify-between mb-6')}>
              <Text style={tailwind.style('text-lg font-inter-semibold-20 text-gray-950')}>
                Editar Etapa
              </Text>
              <View style={tailwind.style('flex-row items-center gap-3')}>
                <Pressable
                  onPress={handleDeleteStage}
                  style={tailwind.style('p-2 opacity-60 active:opacity-100')}>
                  <Icon size={20} icon={<Trash />} />
                </Pressable>
                <Pressable onPress={handleClose} style={tailwind.style('p-1')}>
                  <Text style={tailwind.style('text-gray-600 text-lg')}>✕</Text>
                </Pressable>
              </View>
            </View>

            {/* Nome */}
            <View style={tailwind.style('mb-4')}>
              <Text style={tailwind.style('text-sm text-gray-600 mb-2')}>Nome</Text>
              <Controller
                control={control}
                name="name"
                rules={{ required: 'Nome é obrigatório' }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={tailwind.style(
                      'text-base font-inter-normal-20 py-3 px-4 rounded-xl text-gray-950 bg-white border border-gray-300',
                    )}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Digite o nome da etapa"
                    placeholderTextColor={tailwind.color('text-gray-500')}
                  />
                )}
              />
              {errors.name && (
                <Text style={tailwind.style('text-red-600 text-xs mt-1')}>
                  {errors.name.message}
                </Text>
              )}
            </View>

            {/* Cor */}
            <View style={tailwind.style('mb-4')}>
              <Text style={tailwind.style('text-sm text-gray-600 mb-2')}>Cor</Text>
              <Controller
                control={control}
                name="color"
                render={({ field: { value } }) => (
                  <Pressable
                    onPress={() => colorPickerRef.current?.present()}
                    style={tailwind.style(
                      'flex-row items-center px-4 py-3 bg-white border border-gray-300 rounded-xl',
                    )}>
                    <View
                      style={[
                        tailwind.style('w-6 h-6 rounded-full mr-3'),
                        { backgroundColor: value || color },
                      ]}
                    />
                    <Text
                      style={tailwind.style('text-base font-inter-normal-20 text-gray-950 flex-1')}>
                      {value || color}
                    </Text>
                    <Text style={tailwind.style('text-gray-600 text-lg')}>✎</Text>
                  </Pressable>
                )}
              />
            </View>

            {/* Descrição */}
            <View style={tailwind.style('mb-6')}>
              <Text style={tailwind.style('text-sm text-gray-600 mb-2')}>Descrição</Text>
              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={tailwind.style(
                      'text-base font-inter-normal-20 py-3 px-4 rounded-xl text-gray-950 bg-white border border-gray-300 min-h-[100px]',
                    )}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Digite a descrição da etapa"
                    placeholderTextColor={tailwind.color('text-gray-500')}
                    multiline
                    textAlignVertical="top"
                  />
                )}
              />
            </View>

            {/* Botões */}
            <View style={tailwind.style('flex-row justify-end gap-3')}>
              <Pressable onPress={handleClose} style={tailwind.style('px-6 py-3 rounded-lg')}>
                <Text style={tailwind.style('text-base font-inter-medium-24 text-gray-950')}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={handleSubmit(onSubmit)}
                style={tailwind.style('px-6 py-3 bg-blue-600 rounded-lg')}>
                <Text style={tailwind.style('text-base font-inter-medium-24 text-white')}>
                  Save
                </Text>
              </Pressable>
            </View>
          </View>
        </BottomSheetWrapper>
      </BottomSheetModal>

      {/* Color Picker */}
      <ColorPicker color={color} onColorChange={handleColorChange} sheetRef={colorPickerRef} />
    </>
  );
};
