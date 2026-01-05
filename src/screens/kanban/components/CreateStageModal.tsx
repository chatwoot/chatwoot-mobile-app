import { BottomSheetBackdrop, BottomSheetWrapper, ColorPicker } from '@/components-next';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { kanbanActions } from '@/store/kanban/kanbanActions';
import { selectKanbanFunnels } from '@/store/kanban/kanbanSelectors';
import type { CreateFunnelPayload } from '@/store/kanban/kanbanTypes';
import { tailwind } from '@/theme';
import { logger } from '@/utils/logger';
import { showToast } from '@/utils/toastUtils';
import { BottomSheetModal, useBottomSheetSpringConfigs } from '@gorhom/bottom-sheet';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, Text, TextInput, View } from 'react-native';

interface CreateStageModalProps {
  sheetRef: React.RefObject<BottomSheetModal>;
  onClose: () => void;
  onSuccess?: () => void;
  funnelId?: number; // Adicionar funnelId opcional
}

interface StageForm {
  name: string;
  color: string;
  funnelId: string;
}

export const CreateStageModal: React.FC<CreateStageModalProps> = ({
  sheetRef,
  onClose,
  onSuccess,
  funnelId: providedFunnelId, // Renomear para evitar conflito
}) => {
  const dispatch = useAppDispatch();
  const funnels = useAppSelector(selectKanbanFunnels);
  const colorPickerRef = useRef<BottomSheetModal>(null);
  const [color, setColor] = useState('#00FF00');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      color: '#00FF00',
      funnelId: providedFunnelId?.toString() || funnels?.[0]?.id.toString() || '',
    },
  });

  useEffect(() => {
    // Se funnelId foi fornecido, usar diretamente e resetar o formulário
    if (providedFunnelId) {
      reset({
        name: '',
        color: '#00FF00',
        funnelId: providedFunnelId.toString(),
      });
      setColor('#00FF00');
    } else if (funnels && funnels.length > 0) {
      reset({
        name: '',
        color: '#00FF00',
        funnelId: funnels[0].id.toString(),
      });
      setColor('#00FF00');
    }
  }, [providedFunnelId, funnels, reset]);

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    setValue('color', newColor);
  };

  const onSubmit = async (data: StageForm) => {
    // Se funnelId foi fornecido via props, usar ele diretamente
    const funnelIdToUse = providedFunnelId || (data.funnelId ? parseInt(data.funnelId, 10) : null);

    if (!funnelIdToUse) {
      showToast({ message: 'Selecione um funil' });
      return;
    }

    setIsSubmitting(true);

    try {
      const funnelId = funnelIdToUse;

      // Buscar o funnel atual
      const funnel = await dispatch(kanbanActions.getFunnel(funnelId)).unwrap();

      if (!funnel) {
        showToast({ message: 'Erro ao carregar funil' });
        setIsSubmitting(false);
        return;
      }

      // Converter stages para o formato Record
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

      let maxPosition = -1;

      if (funnel.stages) {
        if (Array.isArray(funnel.stages)) {
          funnel.stages.forEach(stage => {
            const stageKey =
              stage.stage_key ||
              stage.name
                .toLowerCase()
                .replace(/\s+/g, '_')
                .replace(/[^a-z0-9_]/g, '');

            // Type para stage com propriedades opcionais extras da API
            type StageWithExtras = typeof stage & {
              auto_create_conditions?: { type: string; value: string }[];
            };

            const stageWithExtras = stage as StageWithExtras;

            stagesObject[stageKey] = {
              name: stage.name,
              color: stage.color || '#FF6B6B',
              position: stage.position,
              description: stage.description || undefined,
              auto_create_conditions: stageWithExtras.auto_create_conditions || [],
            };

            if (stage.position > maxPosition) {
              maxPosition = stage.position;
            }
          });
        } else if (typeof funnel.stages === 'object') {
          Object.entries(funnel.stages).forEach(([key, stageData]) => {
            stagesObject[key] = {
              name: stageData.name,
              color: stageData.color || '#FF6B6B',
              position: stageData.position || 0,
              description: stageData.description,
              auto_create_conditions:
                (stageData as { auto_create_conditions?: { type: string; value: string }[] })
                  .auto_create_conditions || [],
            };

            const pos = stageData.position || 0;
            if (pos > maxPosition) {
              maxPosition = pos;
            }
          });
        }
      }

      // Criar key para a nova etapa
      const newStageKey = data.name
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');

      // Adicionar nova etapa
      stagesObject[newStageKey] = {
        name: data.name,
        color: data.color,
        position: maxPosition + 1,
        auto_create_conditions: [],
      };

      // Criar payload usando CreateFunnelPayload (a API aceita stages como objeto Record)
      // Mesmo formato usado pelo EditStageModal que funciona
      const updatePayload: CreateFunnelPayload = {
        name: funnel.name,
        description: funnel.description,
        active: funnel.active ?? true,
        stages: stagesObject,
        settings: funnel.settings
          ? {
              agents: (funnel.settings.agents || []).map(
                (a: { id?: number }) => a.id || (a as number),
              ),
            }
          : undefined,
      };

      // Atualizar o funnel (usar 'as never' como no EditStageModal porque a API aceita este formato)
      await dispatch(
        kanbanActions.updateFunnel({
          funnelId,
          payload: updatePayload as never,
        }),
      ).unwrap();

      // Recarregar o funnel
      await dispatch(kanbanActions.getFunnel(funnelId)).unwrap();

      // Recarregar lista de funis
      await dispatch(kanbanActions.getFunnels()).unwrap();

      showToast({ message: 'Etapa criada com sucesso' });
      reset();
      setColor('#00FF00');
      sheetRef.current?.dismiss();
      onSuccess?.();
      onClose();
    } catch (error) {
      logger.error('Error creating stage:', error);
      const errorMessage =
        (error as { message?: string; response?: { data?: { message?: string } } })?.message ||
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Erro ao criar etapa';
      showToast({ message: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setColor('#00FF00');
    sheetRef.current?.dismiss();
    onClose();
  };

  return (
    <>
      <BottomSheetModal
        ref={sheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={BottomSheetBackdrop}
        animationConfigs={animationConfigs}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        onDismiss={() => {
          reset();
          setColor('#00FF00');
        }}>
        <BottomSheetWrapper>
          <View style={tailwind.style('flex-1 px-4 pb-4')}>
            <View style={tailwind.style('flex-row items-center justify-between mb-6')}>
              <Text style={tailwind.style('text-xl font-inter-semibold-20 text-gray-950')}>
                Criar Nova Etapa
              </Text>
              <Pressable onPress={handleClose} style={tailwind.style('p-2')}>
                <Text style={tailwind.style('text-xl text-gray-600')}>✕</Text>
              </Pressable>
            </View>

            {/* Ocultar seletor de funil se funnelId foi fornecido */}
            {!providedFunnelId && (
              <Controller
                control={control}
                name="funnelId"
                rules={{ required: 'Selecione um funil' }}
                render={({ field: { onChange, value } }) => (
                  <View style={tailwind.style('mb-4')}>
                    <Text style={tailwind.style('text-sm text-gray-600 mb-2')}>Funil</Text>
                    <View style={tailwind.style('flex-row')}>
                      {funnels?.map(funnel => (
                        <Pressable
                          key={funnel.id}
                          onPress={() => onChange(funnel.id.toString())}
                          style={[
                            tailwind.style('px-4 py-2 mr-2 rounded-lg border'),
                            value === funnel.id.toString()
                              ? tailwind.style('bg-blue-600 border-blue-600')
                              : tailwind.style('bg-white border-gray-300'),
                          ]}>
                          <Text
                            style={[
                              tailwind.style('text-sm font-inter-medium-24'),
                              value === funnel.id.toString()
                                ? tailwind.style('text-white')
                                : tailwind.style('text-gray-950'),
                            ]}>
                            {funnel.name}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                    {errors.funnelId && (
                      <Text style={tailwind.style('text-red-600 text-xs mt-1')}>
                        {errors.funnelId.message}
                      </Text>
                    )}
                  </View>
                )}
              />
            )}

            <Controller
              control={control}
              name="name"
              rules={{ required: 'Nome da etapa é obrigatório' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={tailwind.style('mb-4')}>
                  <Text style={tailwind.style('text-sm text-gray-600 mb-2')}>Nome da Etapa</Text>
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Ex: Em Progresso"
                    style={tailwind.style(
                      'px-4 py-3 bg-white border border-gray-300 rounded-xl text-base font-inter-normal-20 text-gray-950',
                    )}
                    placeholderTextColor="#9CA3AF"
                  />
                  {errors.name && (
                    <Text style={tailwind.style('text-red-600 text-xs mt-1')}>
                      {errors.name.message}
                    </Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="color"
              render={({ field: { value } }) => (
                <View style={tailwind.style('mb-6')}>
                  <Text style={tailwind.style('text-sm text-gray-600 mb-2')}>Cor</Text>
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
                </View>
              )}
            />

            <Pressable
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              style={[
                tailwind.style('bg-blue-600 px-4 py-3 rounded-xl items-center'),
                isSubmitting && tailwind.style('opacity-50'),
              ]}>
              <Text style={tailwind.style('text-white font-inter-medium-24')}>
                {isSubmitting ? 'Criando...' : 'Criar Etapa'}
              </Text>
            </Pressable>
          </View>
        </BottomSheetWrapper>
      </BottomSheetModal>

      <ColorPicker color={color} onColorChange={handleColorChange} sheetRef={colorPickerRef} />
    </>
  );
};
export default CreateStageModal;
