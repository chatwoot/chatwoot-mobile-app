import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { Icon } from '@/components-next/common';
import i18n from '@/i18n';
import { SplitEmptyState } from '@/navigation/split/SplitEmptyState';
import { InfoCircleIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import { Macro } from '@/types';

import { CARD, ROW_DIVIDER } from './macroStyles';

type MacroListProps = {
  macros: Macro[];
  onSelect: (macro: Macro) => void;
  onRun: (macro: Macro) => void;
  runningId: number | null;
};

export const MacroList = ({ macros, onSelect, onRun, runningId }: MacroListProps) => {
  if (macros.length === 0) {
    return (
      <View style={tailwind.style('pt-16')}>
        <SplitEmptyState message={i18n.t('MACRO.NO_MACROS')} />
      </View>
    );
  }
  return (
    <View style={tailwind.style(CARD)}>
      {macros.map((macro, index) => (
        <View key={macro.id} style={tailwind.style('pl-4')}>
          <View
            style={tailwind.style(
              'flex-row items-center min-h-11 py-[11px] pr-3',
              index < macros.length - 1 && ROW_DIVIDER,
            )}>
            <Text
              numberOfLines={1}
              style={tailwind.style(
                'flex-1 text-[17px] leading-[22px] font-inter-normal-20 text-gray-950',
              )}>
              {macro.name}
            </Text>
            {runningId === macro.id ? (
              <View
                style={tailwind.style('h-8 min-w-[56px] ml-3 mr-2 items-center justify-center')}>
                <ActivityIndicator size="small" />
              </View>
            ) : (
              <Pressable
                onPress={() => onRun(macro)}
                disabled={runningId !== null}
                hitSlop={{ top: 8, bottom: 8 }}
                accessibilityRole="button"
                accessibilityLabel={`${i18n.t('MACRO.ACTIONS.RUN')} ${macro.name}`}
                style={({ pressed }) =>
                  tailwind.style(
                    'h-8 min-w-[56px] px-3 ml-3 mr-2 rounded-full items-center justify-center bg-gray-100',
                    pressed && 'opacity-70',
                  )
                }>
                <Text
                  style={tailwind.style(
                    'text-[15px] leading-[20px] font-inter-medium-24',
                    runningId !== null ? 'text-gray-700' : 'text-blue-800',
                  )}>
                  {i18n.t('MACRO.ACTIONS.RUN')}
                </Text>
              </Pressable>
            )}
            <Pressable
              onPress={() => onSelect(macro)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={macro.name}
              style={({ pressed }) =>
                tailwind.style('h-8 w-8 items-center justify-center', pressed && 'opacity-50')
              }>
              <Icon
                icon={<InfoCircleIcon stroke={tailwind.color('blue-800')} strokeWidth={1.5} />}
                size={22}
              />
            </Pressable>
          </View>
        </View>
      ))}
    </View>
  );
};
