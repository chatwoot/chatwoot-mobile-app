import { PRIORITY_OPTIONS } from '@/screens/kanban/constants';
import { tailwind } from '@/theme';
import React from 'react';
import { Controller } from 'react-hook-form';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useItemForm } from './ItemFormContext';

interface GeneralTabProps {
  priority: string;
  setPriority: (priority: string) => void;
  selectedStageKey: string;
  stages: any[];
  showStageModal: boolean;
  setShowStageModal: (show: boolean) => void;
  selectedFunnelId: number;
  funnels: any[];
  showFunnelModal: boolean;
  setShowFunnelModal: (show: boolean) => void;
  currentFunnelName?: string;
}

export const GeneralTab: React.FC<GeneralTabProps> = ({
  priority,
  setPriority,
  selectedStageKey,
  stages,
  showStageModal,
  setShowStageModal,
  selectedFunnelId,
  funnels,
  showFunnelModal,
  setShowFunnelModal,
  currentFunnelName,
}) => {
  const { form } = useItemForm();
  const { control, formState: { errors } } = form;

  const getStageName = (key: string) => {
    const stage = stages.find(s => s.stage_key === key || s.id?.toString() === key);
    return stage?.name || 'Selecione uma etapa';
  };

  const getFunnelName = (id: number) => {
    const funnel = funnels.find(f => f.id === id);
    return funnel?.name || currentFunnelName || 'Selecione um funil';
  };

  return (
    <View style={tailwind.style('flex-1 px-4 pt-4')}>
      {/* Título */}
      <View style={tailwind.style('mb-4')}>
        <Text style={tailwind.style('text-sm font-inter-medium-24 text-gray-700 mb-1')}>
          Título
        </Text>
        <Controller
          control={control}
          name="title"
          rules={{ required: 'Título é obrigatório' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={tailwind.style(
                'bg-white border border-gray-300 rounded-lg px-3 py-2 text-base text-gray-950 font-inter-normal-20',
                errors.title ? 'border-red-500' : '',
              )}
              placeholder="Digite o título do item"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.title && (
          <Text style={tailwind.style('text-xs text-red-500 mt-1')}>
            {errors.title.message}
          </Text>
        )}
      </View>

      {/* Descrição */}
      <View style={tailwind.style('mb-4')}>
        <Text style={tailwind.style('text-sm font-inter-medium-24 text-gray-700 mb-1')}>
          Descrição
        </Text>
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={tailwind.style(
                'bg-white border border-gray-300 rounded-lg px-3 py-2 text-base text-gray-950 font-inter-normal-20 min-h-[80px]',
              )}
              placeholder="Digite a descrição (opcional)"
              multiline
              textAlignVertical="top"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
      </View>

      {/* Prioridade */}
      <View style={tailwind.style('mb-4')}>
        <Text style={tailwind.style('text-sm font-inter-medium-24 text-gray-700 mb-2')}>
          Prioridade
        </Text>
        <View style={tailwind.style('flex-row flex-wrap gap-2')}>
          {PRIORITY_OPTIONS.map(option => (
            <Pressable
              key={option.value}
              onPress={() => setPriority(option.value)}
              style={tailwind.style(
                'px-3 py-1.5 rounded-full border',
                priority === option.value
                  ? `bg-[${option.color}] border-[${option.color}]`
                  : 'bg-white border-gray-300',
              )}>
              <Text
                style={tailwind.style(
                  'text-xs font-inter-medium-24',
                  priority === option.value ? 'text-white' : 'text-gray-700',
                )}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Funil e Etapa */}
      <View style={tailwind.style('flex-row gap-4 mb-4')}>
        <View style={tailwind.style('flex-1')}>
          <Text style={tailwind.style('text-sm font-inter-medium-24 text-gray-700 mb-1')}>
            Funil
          </Text>
          <Pressable
            onPress={() => setShowFunnelModal(true)}
            style={tailwind.style(
              'bg-white border border-gray-300 rounded-lg px-3 py-2 flex-row justify-between items-center',
            )}>
            <Text
              style={tailwind.style('text-sm text-gray-950 font-inter-normal-20')}
              numberOfLines={1}>
              {getFunnelName(selectedFunnelId)}
            </Text>
            <Text style={tailwind.style('text-gray-500 text-xs')}>▼</Text>
          </Pressable>
        </View>

        <View style={tailwind.style('flex-1')}>
          <Text style={tailwind.style('text-sm font-inter-medium-24 text-gray-700 mb-1')}>
            Etapa
          </Text>
          <Pressable
            onPress={() => setShowStageModal(true)}
            style={tailwind.style(
              'bg-white border border-gray-300 rounded-lg px-3 py-2 flex-row justify-between items-center',
            )}>
            <Text
              style={tailwind.style('text-sm text-gray-950 font-inter-normal-20')}
              numberOfLines={1}>
              {getStageName(selectedStageKey)}
            </Text>
            <Text style={tailwind.style('text-gray-500 text-xs')}>▼</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};
