import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components-next/common';
import {
  GlassCircleButton,
  GlassPillButton,
  HEADER_ICON_COLOR,
} from '@/components-next/side-toolbar/GlassCircleButton';
import { useAppDispatch, useAppSelector } from '@/hooks';
import i18n from '@/i18n';
import { PaneHeader } from '@/navigation/split/PaneHeader';
import { SplitEmptyState } from '@/navigation/split/SplitEmptyState';
import { useSplitView } from '@/navigation/split/SplitViewContext';
import { macroActions } from '@/store/macro/macroActions';
import { selectAllMacros } from '@/store/macro/macroSelectors';
import { ChevronLeft, InfoCircleIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import { Macro } from '@/types';
import { useHaptic } from '@/utils';
import { showToast } from '@/utils/toastUtils';

import { useMacroSteps } from './useMacroSteps';

// Macros in the split view's side column (iPhone Duo), opened from the reply bar's + menu.
// Styled like the Actions column: a light gray page with flat white iOS list cards. Tapping
// a macro shows its steps, with Back and Run in the header.

const CARD = 'rounded-[13px] mx-4 bg-white overflow-hidden';
const ROW_DIVIDER = 'border-b-[0.5px] border-b-blackA-A6';

type MacroListProps = {
  macros: Macro[];
  onSelect: (macro: Macro) => void;
  onRun: (macro: Macro) => void;
  runningId: number | null;
};

// Each row has a Run button, so a macro can run without opening it, and an info button that
// shows its steps (the iOS detail disclosure pattern). The row itself isn't tappable, so a
// stray tap can't run anything.
const MacroList = ({ macros, onSelect, onRun, runningId }: MacroListProps) => {
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

const MacroSteps = ({ macro, conversationId }: { macro: Macro; conversationId: number }) => {
  const steps = useMacroSteps(macro, conversationId);
  return (
    <Animated.View entering={FadeIn.duration(200)} style={tailwind.style(CARD)}>
      {steps.map((step, index) => (
        <View key={index} style={tailwind.style('pl-4')}>
          <View style={tailwind.style('py-[11px] pr-4', index < steps.length - 1 && ROW_DIVIDER)}>
            <Text
              style={tailwind.style(
                'text-[17px] leading-[22px] font-inter-normal-20 text-gray-950',
              )}>
              {step.name}
            </Text>
            {step.value ? (
              <Text
                style={tailwind.style(
                  'pt-0.5 text-[15px] leading-[20px] font-inter-normal-20 text-gray-700',
                )}>
                {step.value}
              </Text>
            ) : null}
          </View>
        </View>
      ))}
    </Animated.View>
  );
};

export const MacrosPane = ({ conversationId }: { conversationId: number }) => {
  const dispatch = useAppDispatch();
  const haptic = useHaptic();
  const splitView = useSplitView();
  const { bottom } = useSafeAreaInsets();
  const macros = useAppSelector(selectAllMacros);
  const [selected, setSelected] = useState<Macro | null>(null);
  const [runningId, setRunningId] = useState<number | null>(null);

  const runMacro = async (macro: Macro) => {
    haptic?.();
    setRunningId(macro.id);
    try {
      await dispatch(
        macroActions.executeMacro({ macroId: macro.id, conversationIds: [conversationId] }),
      ).unwrap();
      showToast({ message: i18n.t('MACRO.EXECUTION_SUCCESS') });
      splitView?.closeSecondary();
    } catch {
      showToast({ message: i18n.t('MACRO.EXECUTION_ERROR') });
    } finally {
      setRunningId(null);
    }
  };

  return (
    <View style={tailwind.style('flex-1')}>
      {selected ? (
        <PaneHeader
          title={selected.name}
          left={
            <GlassCircleButton
              icon={<ChevronLeft stroke={HEADER_ICON_COLOR} strokeWidth={1.5} />}
              onPress={() => setSelected(null)}
              accessibilityLabel={i18n.t('CONVERSATION.HEADER.BACK')}
            />
          }
          right={
            <GlassPillButton
              label={i18n.t('MACRO.ACTIONS.RUN')}
              onPress={() => runMacro(selected)}
              disabled={runningId !== null}
            />
          }
        />
      ) : (
        <PaneHeader title={i18n.t('MACRO.TITLE')} />
      )}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[tailwind.style('pt-2'), { paddingBottom: bottom + 24 }]}>
        {selected ? (
          <MacroSteps macro={selected} conversationId={conversationId} />
        ) : (
          <MacroList
            macros={macros}
            onSelect={setSelected}
            onRun={runMacro}
            runningId={runningId}
          />
        )}
      </ScrollView>
    </View>
  );
};
