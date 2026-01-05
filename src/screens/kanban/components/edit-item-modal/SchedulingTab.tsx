import { tailwind } from '@/theme';
import React from 'react';
import { Pressable, Switch, Text, View } from 'react-native';

interface SchedulingTabProps {
  isScheduled: boolean;
  setIsScheduled: (value: boolean) => void;
  schedulingType: 'deadline' | 'schedule';
  setSchedulingType: (type: 'deadline' | 'schedule') => void;
  deadlineDate: string;
  setDeadlineDate: (date: string) => void;
  scheduledDateTime: string;
  setScheduledDateTime: (date: string) => void;
  // Funções para lidar com pickers
  openDeadlinePicker?: () => void;
  openSchedulePicker?: () => void;
}

export const SchedulingTab: React.FC<SchedulingTabProps> = ({
  isScheduled,
  setIsScheduled,
  schedulingType,
  setSchedulingType,
  deadlineDate,
  scheduledDateTime,
  openDeadlinePicker,
  openSchedulePicker,
}) => {
  return (
    <View style={tailwind.style('flex-1 px-4 pt-4')}>
      <View style={tailwind.style('flex-row items-center justify-between mb-6')}>
        <Text style={tailwind.style('text-base font-inter-medium-24 text-gray-950')}>
          Definir prazo ou agendamento
        </Text>
        <Switch
          value={isScheduled}
          onValueChange={setIsScheduled}
          trackColor={{ false: '#D1D5DB', true: '#BFDBFE' }}
          thumbColor={isScheduled ? '#3B82F6' : '#F3F4F6'}
        />
      </View>

      {isScheduled && (
        <View style={tailwind.style('bg-gray-50 p-4 rounded-lg border border-gray-200')}>
          {/* Tabs de tipo de agendamento */}
          <View style={tailwind.style('flex-row mb-4 bg-gray-200 rounded-lg p-1')}>
            <Pressable
              onPress={() => setSchedulingType('deadline')}
              style={tailwind.style(
                'flex-1 py-1.5 rounded-md items-center',
                schedulingType === 'deadline' ? 'bg-white shadow-sm' : '',
              )}>
              <Text
                style={tailwind.style(
                  'text-sm font-inter-medium-24',
                  schedulingType === 'deadline' ? 'text-gray-900' : 'text-gray-500',
                )}>
                Prazo final
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setSchedulingType('schedule')}
              style={tailwind.style(
                'flex-1 py-1.5 rounded-md items-center',
                schedulingType === 'schedule' ? 'bg-white shadow-sm' : '',
              )}>
              <Text
                style={tailwind.style(
                  'text-sm font-inter-medium-24',
                  schedulingType === 'schedule' ? 'text-gray-900' : 'text-gray-500',
                )}>
                Agendar
              </Text>
            </Pressable>
          </View>

          {schedulingType === 'deadline' ? (
            <View>
              <Text style={tailwind.style('text-sm text-gray-500 mb-1')}>
                Data limite
              </Text>
              <Pressable
                onPress={openDeadlinePicker}
                style={tailwind.style('bg-white border border-gray-300 rounded-lg px-3 py-2')}>
                <Text style={tailwind.style('text-base text-gray-900')}>
                  {deadlineDate || 'Selecione uma data'}
                </Text>
              </Pressable>
            </View>
          ) : (
            <View>
              <Text style={tailwind.style('text-sm text-gray-500 mb-1')}>
                Data e hora do agendamento
              </Text>
              <Pressable
                onPress={openSchedulePicker}
                style={tailwind.style('bg-white border border-gray-300 rounded-lg px-3 py-2')}>
                <Text style={tailwind.style('text-base text-gray-900')}>
                  {scheduledDateTime
                    ? new Date(scheduledDateTime).toLocaleString('pt-BR')
                    : 'Selecione data e hora'}
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      )}
    </View>
  );
};
