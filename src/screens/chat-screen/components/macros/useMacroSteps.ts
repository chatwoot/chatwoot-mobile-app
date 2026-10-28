import { useAppSelector } from '@/hooks';
import { selectAssignableAgentsByInboxId } from '@/store/assignable-agent/assignableAgentSelectors';
import { selectConversationById } from '@/store/conversation/conversationSelectors';
import { selectAllLabels } from '@/store/label/labelSelectors';
import { selectAllTeams } from '@/store/team/teamSelectors';
import { Agent, Macro } from '@/types';
import { expandTabs } from '@/utils/expandTabs';
import {
  resolveActionName,
  resolveAgents,
  resolveLabels,
  resolveTeamIds,
} from '@/utils/macroUtils';

export type MacroStep = { name: string; value: string };

/** A macro's steps as readable names and values (labels, teams and agents by name). */
export const useMacroSteps = (macro: Macro | null, conversationId: number): MacroStep[] => {
  const labels = useAppSelector(selectAllLabels);
  const teams = useAppSelector(selectAllTeams);
  const conversation = useAppSelector(state => selectConversationById(state, conversationId));
  const inboxId = conversation?.inboxId;
  const agents = useAppSelector(state =>
    selectAssignableAgentsByInboxId(state, inboxId ? [inboxId] : [], ''),
  );

  if (!macro?.actions) return [];

  const valueFor = (key: string, params: (string | number)[]) => {
    switch (key) {
      case 'assign_team':
        return resolveTeamIds(teams, params as number[]);
      case 'add_label':
      case 'remove_label':
        return resolveLabels(labels, params as string[]);
      case 'assign_agent':
        return resolveAgents(agents as Agent[], params as number[]);
      case 'send_webhook_event':
      case 'send_message':
      case 'send_email_transcript':
      case 'add_private_note':
        return String(params[0] ?? '');
      default:
        return '';
    }
  };

  return macro.actions.map(({ actionName, actionParams }) => ({
    name: resolveActionName(actionName),
    value: expandTabs(valueFor(actionName, actionParams)),
  }));
};
