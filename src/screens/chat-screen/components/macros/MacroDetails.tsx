import React, { useCallback } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';

import { Icon, Spinner } from '@/components-next';
import i18n from '@/i18n';
import { ChevronLeft } from '@/svg-icons';
import { tailwind } from '@/theme';
import { Agent, Macro } from '@/types';
import { useHaptic, useScaleAnimation } from '@/utils';
import { useAppSelector } from '@/hooks';
import { selectAllLabels } from '@/store/label/labelSelectors';
import { selectAllTeams } from '@/store/team/teamSelectors';
import { selectAssignableAgentsByInboxId } from '@/store/assignable-agent/assignableAgentSelectors';
import {
  resolveActionName,
  resolveTeamIds,
  resolveLabels,
  resolveAgents,
} from '@/utils/macroUtils';
import { selectConversationById } from '@/store/conversation/conversationSelectors';
import { useMacroContext } from './MacroContext';

type MacroDetailsProps = {
  macro: Macro;
  onBack: () => void;
  onClose: () => void;
};

const MacroDetails = ({ macro, onBack, onClose }: MacroDetailsProps) => {
  const hapticSelection = useHaptic();
  const labels = useAppSelector(selectAllLabels);
  const teams = useAppSelector(selectAllTeams);
  const { executeMacro, executingMacroId, conversationId } = useMacroContext();

  // Check if this specific macro is executing
  const isThisMacroExecuting = executingMacroId === macro.id;

  const selectedConversation = useAppSelector(state =>
    selectConversationById(state, conversationId),
  );

  const inboxId = selectedConversation?.inboxId;
  const inboxIds = inboxId ? [inboxId] : [];
  const agents = useAppSelector(state => selectAssignableAgentsByInboxId(state, inboxIds, ''));
  const { handlers, animatedStyle } = useScaleAnimation();

  const getActionValue = (key: string, params: (string | number)[]) => {
    const actionsMap = {
      assign_team: resolveTeamIds(teams, params as number[]),
      add_label: resolveLabels(labels, params as string[]),
      remove_label: resolveLabels(labels, params as string[]),
      assign_agent: resolveAgents(agents as Agent[], params as number[]),
      mute_conversation: null,
      snooze_conversation: null,
      resolve_conversation: null,
      remove_assigned_team: null,
      send_webhook_event: params[0],
      send_message: params[0],
      send_email_transcript: params[0],
      add_private_note: params[0],
    };
    return actionsMap[key as keyof typeof actionsMap] || '';
  };

  const resolvedMacro = () => {
    return macro.actions.map(action => ({
      actionName: resolveActionName(action.actionName),
      actionValue: getActionValue(action.actionName, action.actionParams),
    }));
  };

  const onPress = useCallback(() => {
    hapticSelection?.();
    executeMacro(macro);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View entering={FadeIn.duration(300).springify()} style={tailwind.style('flex-1')}>
      <View style={tailwind.style('flex-row items-center p-4')}>
        <Pressable onPress={onBack} style={tailwind.style('flex-1 flex-row items-center')}>
          <Icon icon={<ChevronLeft />} size={18} style={tailwind.style('mr-1')} />
          <Animated.Text style={tailwind.style('flex-1 text-base')} numberOfLines={1}>
            {macro.name}
          </Animated.Text>
        </Pressable>
        <Animated.View style={animatedStyle}>
          <Pressable
            style={tailwind.style(
              'px-3 py-[7px] rounded-lg bg-gray-100 flex flex-row items-center justify-center min-w-[60px] min-h-[32px]',
            )}
            onPress={onPress}
            {...handlers}>
            {isThisMacroExecuting ? (
              <Spinner size={16} />
            ) : (
              <Animated.Text
                style={tailwind.style(
                  'text-sm font-inter-580-24 leading-[16px] tracking-[0.24px] capitalize text-gray-900',
                )}>
                {i18n.t('MACRO.ACTIONS.RUN')}
              </Animated.Text>
            )}
          </Pressable>
        </Animated.View>
      </View>
      {macro.actions && (
        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={tailwind.style('px-4')}>
          {resolvedMacro().map((action, index) => (
            <View key={index} style={tailwind.style('relative pl-6 pb-4')}>
              {macro.actions && index !== macro.actions.length - 1 && (
                <View
                  style={tailwind.style(
                    'absolute top-[14px] bottom-0 left-[5px] w-[1px] bg-gray-200',
                  )}
                />
              )}
              <View
                style={tailwind.style(
                  'absolute left-0 top-[2px] w-3 h-3 rounded-full bg-gray-300 border-2 border-gray-300',
                )}
              />
              <Animated.Text style={tailwind.style('mb-1')}>{action.actionName}</Animated.Text>
              <Animated.Text style={tailwind.style('text-sm text-gray-900')}>
                {action.actionValue}
              </Animated.Text>
            </View>
          ))}
        </BottomSheetScrollView>
      )}
    </Animated.View>
  );
};

export default MacroDetails;
